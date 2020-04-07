const Logging = require('cccommon/logging').logger('shippingapi.route.shipment.delete.one');
Logging.enable();

const shipDal = require('cccommon/dal/shipment');
const appErr = require('this_pkg/error');
const GwComms = require('cccommon/gwcomms');
const updateDeviceRecord = require('cccommon/keystore');

module.exports = async (req, res, user, shipment) => {
  let gatewayUuid = null;

  //delete this shipment from the database
  try {
    await shipDal.deleteOne(req, shipment);
  } catch(err) {
    appErr.handleRouteServerErr(req, res, err, Logging, 'failed to delete shipment');
    return;
  }

  res.status(204).send();
};
