const Logging = require('cccommon/logging').logger('shippingapi.route.shipment.get');
Logging.enable();

const shipDal = require('cccommon/dal/shipment');
const format = require('cccommon/format');
const appErr = require('this_pkg/error');

exports.list = async (req, res, user) => {
  try {
    const successStatus = 200;
    let statusQuery = req.query.status || '';
    let statusOrFilters = [];

    if (Array.isArray(statusQuery))  {
      statusOrFilters = statusQuery;
    } else {
      statusQuery.split(',').forEach((status) => {
        if (status) {
          statusOrFilters.push(status);
        }
      });
    }

    let list = await shipDal.findByStatus(statusOrFilters);
    let formattedList = [];

    list.forEach((shipment) => {
      formattedList.push(format.shipment.modelToJson(shipment));
    });

    res.status(successStatus).send({shipments: formattedList});
  } catch(findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed to find shipments');
  }
};

exports.one = async (req, res, user, shipment) => {
  res.status(200).send(format.shipment.modelToJson(shipment));
};
