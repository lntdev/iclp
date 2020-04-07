const Logging = require('cccommon/logging').logger('keystore.route.keystore.post');
Logging.enable();
const format = require('cccommon/format');
const appErr = require('this_pkg/error');
const keystoreDal = require('cccommon/dal/keystore');

exports.handler = async (req, res, user) => {
  try {
    let uuid = req.body.deviceUuid;
    const valErrs = [];
    if (!uuid) {
      valErrs.push({uuid: 'missing'});
    }
    if (uuid.length != 32) {
      //valErrs.push({uuid: 'invalid'});
    }
    if (valErrs.length) {
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
      return;
    }
    const successStatus = 200;
    var pass = 1;
    var result = {}
    Logging.msg("Request.body: " + JSON.stringify(req.body));
    keystoreDal.insertRecord(req.body, function(err, data){
       if (!err) {
   	   result.result = "pass";
           res.status(successStatus).send(result);
       }
       else{
	   Logging.msg(err);
           result.result = err;
           res.status(202).send(result);
       }
       return;
    });
  } catch(findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'REST API execution error!');
  }
};
