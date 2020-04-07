const Logging = require('cccommon/logging').logger('shippingapi.route.shipment.delete.all');
Logging.enable();

const shipDal = require('cccommon/dal/shipment');
const appErr = require('this_pkg/error');

module.exports = async (req, res) => {
  try {
    //await shipDal.deleteAll(req);
    appErr.handleRouteServerErr(req, res, err, Logging, 'DELETE All shipments has been deleted, pls talk to the admin to enable it..');
  } catch(err) {
    appErr.handleRouteServerErr(req, res, err, Logging, 'failed to delete all shipments');
    return;
  }

  res.status(204).send();
};
