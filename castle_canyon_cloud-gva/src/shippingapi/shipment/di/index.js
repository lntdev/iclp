const Logging = require('cccommon/logging').logger('shippingapi.shipment.di');
Logging.enable();

const shipDal = require('cccommon/dal/shipment');
const format = require('cccommon/format');
const appErr = require('this_pkg/error');

module.exports = (handler) => {
  return async (req, res, user) => {
    let shipment;

    try {
      const id = format.dataType.forceZeroOrPositiveInt(req.params.id);

      if (!id) {
        appErr.send(req, res, 'not_found');
        return;
      }

      shipment = await shipDal.findByPrimaryKey(id);

      if (!shipment) {
        appErr.send(req, res, 'not_found');
        return;
      }
    } catch(findErr) {
      appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed to find shipment by primary key');
      return;
    }

    await handler(req, res, user, shipment);
  };
};
