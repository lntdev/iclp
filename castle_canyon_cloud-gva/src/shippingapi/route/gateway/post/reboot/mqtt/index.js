const Logging = require('cccommon/logging').logger('shippingapi.route.gateway.post.reboot.mqtt');
Logging.enable();

const gwmClient = require('cccommon/client/gwmessenger');
const dal = require('cccommon/dal');
const shipDal = dal.shipment;
const appErr = require('this_pkg/error');

exports.handler = async (req, res, user) => {
  try {
    const successStatus = 200;
    const gatewayId = req.params.id

    Logging.msg("GW id to reboot: " + gatewayId);
    var result = await gwmClient.rebootGateway(req, gatewayId);
    Logging.msg("res: " + JSON.stringify(result));
    if (result.status != 200) {
      let reason = JSON.parse(result.response.text);
      //Logging.msg("text: " + JSON.stringify(reason.details.name));
      res.status(202).send({ Error: reason.details.name });
      return;
    }
    res.status(successStatus).send("");
  } catch (findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed');
  }
}
