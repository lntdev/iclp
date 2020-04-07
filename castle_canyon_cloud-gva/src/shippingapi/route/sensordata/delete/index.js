const Logging = require('cccommon/logging').logger('shippingapi.route.sensordata.delete');
Logging.enable();

const sensorDal = require('cccommon/dal/sensordata');
const shipDal = require('cccommon/dal/shipment');
const format = require('cccommon/format');
const appErr = require('this_pkg/error');

exports.all = async (req, res, user, shipmentData) => {
    try {
        const successStatus = 200;
        const id = format.dataType.forceZeroOrPositiveInt(req.params.id);
        Logging.msg("Deleting data for ShipmentId: " + id);
        setImmediate(sensorDal.deleteByShipmentId, id, function (err, data) {
            if (err) {
                Logging.msg("Error: in deleting Sensor Data: " + err);
                return;
            }
            else {
                res.status(successStatus).send({ 'deletedRecords': data });
            }
        });
    } catch (findErr) {
        appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed to find sensordata');
    }
};
