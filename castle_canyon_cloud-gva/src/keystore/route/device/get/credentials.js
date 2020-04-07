const Logging = require('cccommon/logging').logger('keystore.route.device.get.credentials');
Logging.enable();
const appErr = require('this_pkg/error');
const keystoreDal = require('cccommon/dal/keystore');
const crypto = require('crypto');

module.exports = async (req, res) => {
  try {
    let spec = {};
    spec.uuid = req.params.uuid;
    spec.challengeResponse = req.query.challengeResponse;

    Logging.msg('credentails requested', {
      uuid: spec.uuid,
      challengeResponse: spec.challengeResponse
    });

    const valErrs = validateSpec(spec);
    if (valErrs.length) {
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
      return;
    }

    keystoreDal.findByUuid(spec.uuid, function(error, data){
      if(error){
        appErr.send(req, res, 'other', 'error calling mongoDb api');
        return;
      }
      if(data) {
        Logging.msg('data: ' + JSON.stringify(data));
        // TODO: Compare the if the challenge issued matches the response
        try {
          provisionData = JSON.parse(data.provisionData) || {};
          deviceConnectionCredentials = JSON.parse(data.deviceConnectionCredentials) || {};
        } catch (e) {
            Logging.msg('error: ' + e);
            appErr.send(req, res, 'other', 'Unable to find UUID in Database:');
            return;
        }
        let azureDeviceCredentials = {};
        if (Object.keys(deviceConnectionCredentials).length) {
          Logging.msg("device Cred: " + JSON.stringify(deviceConnectionCredentials));
          azureDeviceCredentials.uri = deviceConnectionCredentials.uri;
          azureDeviceCredentials.deviceId = deviceConnectionCredentials.deviceId;
          azureDeviceCredentials.primaryKey = deviceConnectionCredentials.primaryKey;
          azureDeviceCredentials.secondaryKey = deviceConnectionCredentials.secondaryKey;
          azureDeviceCredentials.connString = deviceConnectionCredentials.connectionString;
        }
        let response = {
          gatewayUuid:spec.uuid,
          provisionData: provisionData,
          connectionCredentials: {
            deviceCredentials: {
              cloudType: "azureIotHub",
              "azureIotHub": azureDeviceCredentials
           }
         }
        }
        res.status(200).send(response);
        return;
      } else {
        Logging.msg('uuid was not found in database');
        res.status(404).send();
        return;
      }
    });
  } catch(findErr) {
    AppErr.handleRouteServerErr(req, res, findErr, Logging, 'REST API execution error!');
    return;
  }
}

function validateSpec(spec) {
  const valErrs = [];
  if((spec.uuid == null) || (spec.uuid.length != 32)){
    valErrs.push({uuid: 'missing/empty or invalid'});
  }
  if((spec.challengeResponse == null) || (spec.challengeResponse == '') || (spec.challengeResponse.length == 0)){
    valErrs.push({challengeResponse: 'missing/empty or invalid'});
  }
  return valErrs;
}

