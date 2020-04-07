const Logging = require('cccommon/logging').logger('shippingapi.route.gateway.get');
Logging.enable();

const gwDal = require('cccommon/dal/gateway');
const format = require('cccommon/format');
const appErr = require('this_pkg/error');

module.exports = async (req, res, user) => {
  try {
    const successStatus = 200;
    const gatewayId = req.params.id;
    Logging.msg('req for: ' + gatewayId);

    let ret;
    await gwDal.findByUUID(gatewayId)
      .then((msg) => {
         Logging.msg('got gw: ' + JSON.stringify(msg))
         let gwdetails = msg[0];
         ret = {
           "gatewayId": gwdetails.uuid,
           "gatewayWsnId": gwdetails.wsnId,
           "panId": gwdetails.panId,
           "channelId": gwdetails.channelId,
           "macroInterval": gwdetails.macroInterval,
           "microInterval": gwdetails.microInterval
         };
         res.status(successStatus).send(ret);
      })
      .catch((msg) => {
        Logging.msg('ubable to get gw: ' + JSON.stringify(msg));
        res.status(404).send(null);
      });

  } catch(findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed to find gateway');
  }
}

