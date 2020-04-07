const Logging = require('cccommon/logging').logger('keystore.route.device.get.challenge');
Logging.enable();
const appErr = require('this_pkg/error');
const keystoreDal = require('cccommon/dal/keystore');
const security = require('cccommon/security/security');
const idgen = require('cccommon/idgen/idgen');

module.exports = async (req, res) => {
  try {
    let spec = {};
    spec.uuid = req.params.uuid;
    spec.gwEcdhPublicKey = req.query.gwEcdhPublicKey;

    Logging.msg('challenge requested', {
      uuid: spec.uuid,
      gwEcdhPublicKey: spec.gwEcdhPublicKey
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
        // TODO: compare the uuid with the ecdh public key of the device
        let challenge = idgen.get_session_nonce();
        let deviceChallenge = {
          gvaEcdhPublicKey: security.getGvaEcdhPublicKey(),
          deviceChallenge: challenge,
          timeOfChallenge: Date.now()
        };
        keystoreDal.updateDeviceChallenge(spec.uuid, JSON.stringify(deviceChallenge), function (result) {
          if (result)
            res.status(200).send(deviceChallenge);
          else 
            appErr.send(req, res, 'other', 'error updating challenge in device record');
          return;
        });
      } else {
        Logging.msg('uuid was not found in database');
        res.status(404).send();
        return;
      }
    });
  } catch(findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'REST API execution error!');
    return;
  }
}

function validateSpec(spec) {
  const valErrs = [];
  if((spec.uuid == null) || (spec.uuid.length != 32)){
    valErrs.push({uuid: 'missing/empty or invalid'});
  }
  if((spec.gwEcdhPublicKey == null) || (spec.gwEcdhPublicKey == '') || (spec.gwEcdhPublicKey.lenght == 0)){
    valErrs.push({gwEcdhPublicKey: 'missing/empty or invalid'});
  }
  return valErrs;
}
