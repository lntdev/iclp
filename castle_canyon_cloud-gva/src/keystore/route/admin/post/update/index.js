const Logging = require('cccommon/logging').logger('keystore.route.keystore.post');
Logging.enable();
const format = require('cccommon/format');
const appErr = require('this_pkg/error');
const keystoreDal = require('cccommon/dal/keystore');

module.exports = async (req, res, user) => {
  try {

    let spec = req.body;

    const valErrs = await exports.validateSpec(spec);
    if (valErrs.length) {
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
      return;
    }

    const successStatus = 200;
    keystoreDal.updateOrCreate(
      spec.deviceUuid,
      spec.deviceCredentials,
      spec.provisionData,
      function(result){
       if (result) {
         res.status(successStatus).send('');
         return;
       } else {
         appErr.send(req, res, 'other', ['error updating keystore database']);
         return;
       }
       return;
    });
  } catch(findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'REST API execution error!');
  }
};

exports.validateSpec = async (spec) => {
  const valErrs = [];

  function present(v) {
    return v && v != '';
  }

  if (!present(spec.deviceUuid)) {
    valErrs.push({'deviceUuid': 'missing/empty'});
  }
/*
  if (!present(spec.shipmentId)) {
    valErrs.push({'shipmentId': 'missing/empty'});
  }

  if (!present(spec.gvaId)) {
    valErrs.push({'gvaId': 'missing/empty'});
  }

  if (!present(spec.deviceCredentials)) {
    valErrs.push({'deviceCredentials': 'missing/empty'});
  }

  if (!present(spec.gvaCredentials)) {
    valErrs.push({'gvaCredentials': 'missing/empty'});
  }
*/
  return valErrs;
}

