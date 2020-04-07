const Logging = require('cccommon/logging').logger('shippingapi.route.shipments.put.locations');
Logging.enable();

const sensorDal = require('cccommon/dal/sensordata');
const shipDal = require('cccommon/dal/shipment');
const format = require('cccommon/format');
const appErr = require('this_pkg/error');

module.exports = async (req, res, user, shipmentId) => {
    try {
        const successStatus = 200;
        var shipmentid = req.params.id;
        if (isNaN(shipmentid)) {
            Logging.msg("using shipDal.findByShipmentId for shipment lookup: " + shipmentid);
            var queryFn = shipDal.findByShipmentId;
        }
        else {
            Logging.msg("using shipDal.findByPrimaryKey for shipment lookup: " + shipmentid);
            var queryFn = shipDal.findByPrimaryKey;
        }
        queryFn(shipmentid)
            .then(function (shipment) {
                try {
                    if (shipment) {
                        Logging.msg("about to update location in shipping record...");
                        shipment.update({
                            telemetryReportingTime: req.query.time,
                            telemetryLatitude: req.query.latitude,
                            telemetryLongitude: req.query.longitude,
                        }).then(function (ok) {
                            Logging.msg("shipment location updated successfully!");
                        }, function (err) {
                            Logging.msg("while updating shipment location error occurred!");
                        });
                    }
                    else {
                        Logging.msg("shipment record not valid in database..can't update location!");
                    }
                }
                catch (err) {
                    Logging.msg("caugh err in then()", { obj: err });
                }
                res.status(successStatus).send("");
                setImmediate(shipment);
            })
    }
    catch (err) {
        Logging.msg("caugh err in then()", { obj: err });
    }
};

