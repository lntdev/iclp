const Logging = require('cccommon/logging').logger('shippingapi.route.sensordata.get.gateway');
Logging.enable();

const sensorDal = require('cccommon/dal/sensordata');
const shipDal = require('cccommon/dal/shipment');
const format = require('cccommon/format');
const appErr = require('this_pkg/error');

exports.list = async (req, res, user, shipmentData) => {
  try {
    const successStatus = 200;
    Logging.msg('path: ' + req.path);
    Logging.msg('params: ' + JSON.stringify(req.params));
    const gatewayId = req.params.gatewayId;

    // Validate gateway UUID
    if (gatewayId === null || gatewayId === '' || gatewayId === undefined) {
      Logging.msg("Error: GatewayId is invalid");
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList([{ 'gatewayId': 'invalid' }]));
      return;
    }

    Logging.msg("Quering for GatewayId : " + gatewayId);

    setImmediate(sensorDal.findByGatewayId, gatewayId, function (err, data) {
      if (err) {
        Logging.msg("Error: in getting Gateway Sensor Data: " + err);
        return;
      }
      let list = data;
      let formattedList = [];
      list.forEach((shipment) => {
        formattedList.push(shipment);
      });

      res.status(successStatus).send({ sensordata: formattedList });

    });
  } catch (findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed to find Gateway sensordata');
  }
};

exports.one = async (req, res, user, shipment) => {
  res.status(200).send(format.shipment.modelToJson(shipment));
};
