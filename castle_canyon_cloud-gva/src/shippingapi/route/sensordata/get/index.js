const Logging = require('cccommon/logging').logger('shippingapi.route.sensordata.get');
Logging.enable();

const sensorDal = require('cccommon/dal/sensordata');
const shipDal = require('cccommon/dal/shipment');
const format = require('cccommon/format');
const appErr = require('this_pkg/error');

exports.list = async (req, res, user, shipmentData) => {
  try {
    const successStatus = 200;
    const id = format.dataType.forceZeroOrPositiveInt(req.params.id);
    Logging.msg("Quering for ShipmentId: " + id);
    setImmediate(sensorDal.findByShipmentId, id, function (err, data) {
      if (err) {
        Logging.msg("Error: in getting Sensor Data: " + err);
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
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed to find sensordata');
  }
};

exports.one = async (req, res, user, shipment) => {
  res.status(200).send(format.shipment.modelToJson(shipment));
};
