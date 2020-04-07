const Logging = require('cccommon/logging').logger('shippingapi.route.gateway.post.airplanemode');
Logging.enable();

const gwmClient = require('cccommon/client/gwmessenger');
const dal = require('cccommon/dal');
const shipDal = dal.shipment;
const appErr = require('this_pkg/error');

exports.handler = async (req, res, user) => {
  try {
    const successStatus = 200;
    const gatewayId = req.params.id;
    const timeDuration = req.params.time;

    Logging.msg("GW id to put into airplan mode: " + gatewayId);
    Logging.msg("Time duration to put into Airplane Mode: " + timeDuration);

    if(isNaN(timeDuration) || timeDuration < 1) {
        Logging.msg("Invalid Time parameter!!");
        res.status(202).send({ Error: "The Time Duration received is Invalid, please request with a valid time, received: " + newChannel});
        return;
    }
    //Temporary: Removed check for only GW associated with an existing shipment
    //const inShipments = await shipDal.findByGatewayUUID(gatewayId, null);
    //if(inShipments.length){
    if(true){
        var result = await gwmClient.airplaneMode(req, gatewayId);
        Logging.msg("res: " + JSON.stringify(result));
        if (result.status != 200){
           let reason = JSON.parse(result.response.text);
           //Logging.msg("text: " + JSON.stringify(reason.details.name));
           res.status(202).send({ Error: reason.details.name});
           return;
        }
    } else {
        Logging.msg("GW is not available in the database");
        res.status(202).send({ Error: "Gateway was not found in GVA DB, unable to put into airplane mode."});
        return;
    }

    res.status(successStatus).send("");
  } catch(findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed');
  }
}
