const Logging = require('cccommon/logging').logger('shippingapi.route.session.post');
Logging.enable();

const Commonconfig  = require('cccommon/config');
const userDal = require('cccommon/dal/user');
const appErr = require('this_pkg/error');

exports.handler = async (req, res) => {
  let user;

  const successStatus = 201;
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;
  const valErrs = [];

  if (!username) {
    valErrs.push({email: 'missing'});
  }
  if (!password) {
    valErrs.push({password: 'missing'});
  }
  if (!role) {
    valErrs.push({role: 'missing'});
  }
  if(!(role == "Dock Worker" || role == "Desk Agent")) {
    valErrs.push({role: 'invalid type'});
  }
  if (valErrs.length) {
    appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
    return;
  }

  try {
    user = await userDal.findByCred(username, password);
    Logging.msg("user: " + JSON.stringify(user));
  } catch (err) {
    appErr.handleRouteServerErr(req, res, err, Logging, 'failed to query for user');
    return;
  }

  if (!user) {
    appErr.send(req, res, 'unauthorized');
    return;
  }
  
  if (!userDal.hasRole(user, role)) {
    appErr.send(req, res, 'unauthorized role');
    return;
  }

  let token;
  if (!user.token) {
    try {
      await userDal.genToken(user);
    } catch (err) {
      appErr.handleRouteServerErr(req, res, err, Logging, 'failed to update/generate user token');
      return;
    }
  }

  res.status(successStatus).send({
      token: user.token,
      gva_version: Commonconfig.logging.build_info()
  });
};
