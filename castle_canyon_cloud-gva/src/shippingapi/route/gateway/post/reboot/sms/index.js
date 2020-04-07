const Logging = require('cccommon/logging').logger('shippingapi.route.gateway.post.reboot.sms');
Logging.enable();

const dal = require('cccommon/dal');
const shipDal = dal.shipment;
const appErr = require('this_pkg/error');

exports.handler = async (req, res, user) => {
  try {
    const successStatus = 200;
    const gatewayId = req.params.id

    Logging.msg("GW id to reboot: " + gatewayId);

    // immediatly return, as implementation is not yet complet..
    // still need to implement a method to get the GW's phone number in GVA
    res.status(202).send({ Error: "API is not yet implemented"});
    return;


    const inShipments = await shipDal.findByGatewayUUID(gatewayId, null);
    //Logging.msg("retrun: " + JSON.stringify(inShipments));
    if(inShipments.length){
        //await gwmClient.rebootGateway(req, gatewayId);
	// make sms call here..
    } else {
        Logging.msg("GW is not available in the database");
        res.status(204).send({ Error: "Gateway was not found in GVA DB, unable to reset!"});
        return;
    }

    res.status(successStatus).send("");
  } catch(findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed');
  }
}
