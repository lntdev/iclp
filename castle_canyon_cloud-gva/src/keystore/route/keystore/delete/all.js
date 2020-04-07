const Logging = require('cccommon/logging').logger('keystore.route.keystore.delete');
Logging.enable();
const format = require('cccommon/format');
const appErr = require('this_pkg/error');
const keystoreDal = require('cccommon/dal/keystore');

module.exports = async (req, res, user) => {
  try {
    const successStatus = 200;
    var pass = 1;
    var result = {}
    Logging.msg("Request.query: " + JSON.stringify(req.query));
    Logging.msg("password: " + req.query.password);
    if(req.query.password == "IwantToDeleteAll"){
    keystoreDal.deleteAll(function(error, data){
        if(error) {
	    Logging.msg("Error: " + error);
	}

	Logging.msg("deleted keystore data: " + data);

     if (pass)
        result.result = "pass";
     else
        result.result = "fail";
     res.status(successStatus).send(result);
    })
  }
  else{
    result.resutl = "invalid password";    
    res.status(successStatus).send(result);
   
   }
  } catch(findErr) {
    appErr.handleRouteServerErr(req, res, findErr, Logging, 'REST API execution error!');
  }
};
