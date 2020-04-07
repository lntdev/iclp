const Logging = require('cccommon/logging').logger('keystore.route.keystore.authenticate.get');
Logging.enable();
const format = require('cccommon/format');
const appErr = require('this_pkg/error');
const keystoreDal = require('cccommon/dal/keystore');

exports.one = async (req, res, user) => {
  try {
    const successStatus = 200;
    Logging.msg("Request.query: " + JSON.stringify(req.query));
    Logging.msg("UUID: " + req.query.UUID);
    
    let uuid = req.query.UUID;
    const valErrs = [];    
    if (!uuid) {
      valErrs.push({uuid: 'missing'});
    }
    if (uuid.length != 32) {
      valErrs.push({uuid: 'invalid'});
    }
    if (valErrs.length) {
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
      return;
    }
    keystoreDal.findByUuid(req.query.UUID, function(error, data){
        if(error) {
	    Logging.msg("Error: " + error);
            res.status(202).send(error);
            return;
	}
        if (data == null) {
            Logging.msg("No Data from MongoDB ");
            res.status(202).send({error:'deviceUUID not found in KeyStore Database'});
            return;
        }           
        Logging.msg("keystore data length: " + data.length);
	Logging.msg("retrived keystore data: " + data);

     res.status(successStatus).send(data);
     return;
    })
  } catch(findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'REST API execution error!');
  }
};
