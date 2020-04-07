const Logging = require('cccommon/logging').logger('shippingapi.route.gateway.get.credentials');
Logging.enable();

const dal = require('cccommon/dal');
const appErr = require('this_pkg/error');
const statusHelper = require('this_pkg/shipment/status');
const createDevice = require('cccommon/gwcomms').createGwDevice;

exports.handler = async (req, res, user, shipment) => {
  let err = '';
  Logging.msg('Gateway ID: ' + req.params.id);
  try{
      var deviceCredentials;
      let update = await createDevice(req.params.id)
        .then(async function(result) {
           Logging.msg("Device created: " + JSON.stringify(result));
           var connectionString=
             "HostName=" + result.uri + ";" +
             "DeviceId=" + result.deviceId + ";" +
             "SharedAccessKey=" + result.authentication.symmetricKey.primaryKey;
           deviceCredentials = {
              cloudType: "azure",
              azure: {
                uri: result.uri,
                deviceId: result.deviceId,
                primaryKey: result.authentication.symmetricKey.primaryKey,
                secondaryKey: result.authentication.symmetricKey.secondaryKey,
                connString: connectionString
              }
           }
         })
         .catch(function(err) {
           if(error){
             err += "error creating device: " + error + ";";
             Logging.msg(err);
             appErr.send(req, res, 'other', ["there was and error when tyring to reigster gw device"]);
             return false;
           }
         });
      res.status(202).send(deviceCredentials);
      return;
  } catch(error) {
    err += "Unable to create gw credentials: " + error + ";";
    Logging.msg(err);
    appErr.handleRouteServerErr(req, res, err, Logging, 'failed to generate credentials');
    return;
  }
}

