const Logging = require('cccommon/logging').logger('shippingapi.route.gateway.post.calibrate');
Logging.enable();

const gwmClient = require('cccommon/client/gwmessenger');
const dal = require('cccommon/dal');
const shipDal = dal.shipment;
const appErr = require('this_pkg/error');

exports.handler = async (req, res, user) => {
  try {
    const successStatus = 200;
    const gatewayId = req.params.id

    Logging.msg("GW id to calibrate: " + gatewayId);

    //Temporary: Removed check for only reboot of GW associated with shipment
    //const inShipments = await shipDal.findByGatewayUUID(gatewayId, null);
    //if(inShipments.length){
    if(true){
        var result = await gwmClient.calibrateGateway(req, gatewayId);
        Logging.msg("res: " + JSON.stringify(result));
        if (result.status != 200){
           let reason = JSON.parse(result.response.text);
           //Logging.msg("text: " + JSON.stringify(reason.details.name));
           res.status(202).send({ Error: reason.details.name});
           return;
        }
    } else {
        Logging.msg("GW is not available in the database");
        res.status(202).send({ Error: "Gateway was not found in GVA DB, unable to calibrate!"});
        return;
    }

    res.status(successStatus).send("");
  } catch(findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed');
  }
}
