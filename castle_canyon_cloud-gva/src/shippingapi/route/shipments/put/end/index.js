const Logging = require('cccommon/logging').logger('shippingapi.route.shipment.put.end');
Logging.enable();
const dal = require('cccommon/dal');
const shipDal = require('cccommon/dal/shipment');
const statusConst = require('cccommon/constant').status;
const appErr = require('this_pkg/error');
const statusHelper = require('this_pkg/shipment/status');
const sensorDataDal = require('cccommon/dal/sensordata');
const gwmClient = require('cccommon/client/gwmessenger');

module.exports = async (req, res, user, shipment) => {
  const fromStatus = shipment.status;
  let toStatus;
  let transaction;

  try {
    if (fromStatus === statusConst.inMonitoring()) {
      toStatus = statusConst.completedDeinstrumented();
    } else {
      // Middleware that validates status transitions should not let this case happen.
      // Catch it in case there's a regression.
      throw new Error(`end handler encountered an unexpected from-status [${fromStatus}]`);
    }
    await removeTagsFromGateway(shipment);
    transaction = await dal.getTransaction();
    await shipDal.deinstrument(req, shipment, toStatus, {
      transaction: transaction
    });
    await shipDal.updateStatus(shipment, toStatus);
    await transaction.commit();
  } catch (err) {
    Logging.msg('Error while trying to end shipment: ' + err);
    if (transaction) await transaction.rollback();
    appErr.handleRouteServerErr(req, res, err, Logging, 'failed to change shipment status');
    return;
  }

  statusHelper.logTransitionSuccess(req, Logging, user, shipment, fromStatus, toStatus);
  res.status(204).send();
};

async function removeTagsFromGateway(shipment) {
  const tagsInShipment = [];
  shipment.shippingUnits.forEach(shippingUnit => {
    shippingUnit.tags.forEach(tag => {
      tagsInShipment.push(tag.uuid);
    });
  });
  //Logging.msg('removeTagsFromGateway shipment: ' + JSON.stringify(shipment));
  //Logging.msg('tagsInShipment: ' + JSON.stringify(tagsInShipment));

  let gatewaysList = {};
  for (let tagId of tagsInShipment) {
    //let lastRecord = await sensorDataDal.getLastRecordforTagId(tagId);
    let lastRecord = await sensorDataDal.getLastAddTagResponseRecordByTagId(tagId);
    if (!lastRecord) continue;
    //Logging.msg('lastRecord: ' + lastRecord);
    //Logging.msg('tag shipmentId: ' + JSON.parse(lastRecord.handle).shipmentId);
    //Logging.msg('shipmentId: ' + shipment.id);
    if (JSON.parse(lastRecord.handle).shipmentId != shipment.id) continue;
    if (!gatewaysList[lastRecord.gatewayId])
      gatewaysList[lastRecord.gatewayId] = [];
    gatewaysList[lastRecord.gatewayId].push(tagId);
  };

  Logging.msg('gatewaysList: ' + JSON.stringify(gatewaysList));

  for (let gatewayId in gatewaysList) {
    var req = {
      body: {
        tagList: gatewaysList[gatewayId]
      },
      id: ''
    };
    Logging.msg('gatewayId: ' + gatewayId);
    Logging.msg('gwmessenger request: ' + JSON.stringify(req));
    await gwmClient.removeTag(req, gatewayId);
  }
}
