const Logging = require('cccommon/logging').logger('shippingapi.route.shipment.post.calibrate');
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
  const successStatus = 200;

  try {
    // Validate shipment status to be inMonitoring
    if (fromStatus !== statusConst.inMonitoring()) {
      Logging.msg('Shipment is not inMonitoring state to trigger device calibration command. : ' + fromStatus);
      res.status(202).send({ Error: "Shipment is not inMonitoring state to trigger device calibration command : " + fromStatus + "" });
      return;
    }

    // Trigger device calibration command to all associated devices
    await calibrateDevicesInShipment(shipment);
    res.status(successStatus).send();
    return;
  } catch (err) {
    Logging.msg('Error while triggering device calibration command : ' + err);
    appErr.handleRouteServerErr(req, res, err, Logging, 'failed to trigger device calibration command.');
    return;
  }
};

async function calibrateDevicesInShipment(shipment) {
  // Get list of Tag UUID's in a given shipment
  const tagsInShipment = [];
  shipment.shippingUnits.forEach(shippingUnit => {
    shippingUnit.tags.forEach(tag => {
      tagsInShipment.push(tag.uuid);
    });
  });
  //Logging.msg('tagsInShipment: ' + JSON.stringify(tagsInShipment));

  // Loop over each Tag UUID and get last associated gateway UUID
  let gatewaysList = {};
  for (let tagId of tagsInShipment) {
    // Get last associated gateway UUID form AddTagResponseRecord collection
    let lastRecord = await sensorDataDal.getLastAddTagResponseRecordByTagId(tagId);
    if (!lastRecord) continue;

    // Is Tag device last associated to current shipment?
    if (JSON.parse(lastRecord.handle).shipmentId != shipment.id) continue;
    if (!gatewaysList[lastRecord.gatewayId])
      gatewaysList[lastRecord.gatewayId] = [];
    gatewaysList[lastRecord.gatewayId].push(tagId);
  };

  Logging.msg('gatewaysList: ' + JSON.stringify(gatewaysList));

  // Loop over each associated gateway UUID list and then trigger device calibration command.
  for (let gatewayId in gatewaysList) {
    // Add tag list, specific to gateway
    var req = {
      body: {
        tagList: gatewaysList[gatewayId]
      },
      id: ''
    };
    Logging.msg('gatewayId: ' + gatewayId);
    Logging.msg('gwmessenger request: ' + JSON.stringify(req));
    // Trigger device calibration command
    await gwmClient.calibrateGateway(req, gatewayId);
  }
}
