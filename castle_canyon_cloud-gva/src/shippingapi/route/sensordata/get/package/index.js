const Logging = require('cccommon/logging').logger('shippingapi.route.sensordata.get.package');
Logging.enable();

const sensorDal = require('cccommon/dal/sensordata');
const shipDal = require('cccommon/dal/shipment');
const format = require('cccommon/format');
const appErr = require('this_pkg/error');

exports.list = async (req, res, user, shipmentData) => {
  try {
    const successStatus = 200;
    Logging.msg('params: ' + JSON.stringify(req.params));
    const shipmentId = req.params.shipmentId;
    const packageId = req.params.packageId;
    let onlyAnomalies = false;

    // Validate Input
    if (shipmentId === null || shipmentId === '' || shipmentId === undefined || isNaN(shipmentId)) {
      Logging.msg('Error: ShipmentId is invalid');
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList([{'shipementId' : 'invalid'}]));
      return;
    }

    if (packageId === null || packageId === '' || packageId === undefined) {
      Logging.msg("Error: packageId is invalid");
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList([{'packageId' : 'invalid'}]));
      return;
    }

    Logging.msg("Quering for Package Id: " + packageId + " in ShipmentId: " + shipmentId);

    if(req.path.includes('/alerts')) {
      Logging.msg('Searching for alerts only');
      onlyAnomalies = true;
    }

    setImmediate(sensorDal.findByPackageId, shipmentId, packageId, onlyAnomalies, function (err, data) {
      if (err) {
        Logging.msg("Error: in getting package Sensor Data: " + err);
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
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed to find package sensordata');
  }
};

exports.one = async (req, res, user, shipment) => {
  res.status(200).send(format.shipment.modelToJson(shipment));
};
