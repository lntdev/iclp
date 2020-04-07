const Logging = require('cccommon/logging').logger('shippingapi.auth.token');
Logging.enable();

const userDal = require('cccommon/dal/user');
const appErr = require('this_pkg/error');

exports.REQUIRED = (handler) => {
  return async (req, res) => {
    let user;

    try {
      user = await exports.getUserByAuthHeader(req, res);
    } catch (err) {
      appErr.handleRouteServerErr(req, res, err, Logging, 'failed to query for user');
      return;
    }

    if (!user) {
      appErr.send(req, res, 'unauthorized');
      return;
    }

    await handler(req, res, user);
  };
};

exports.OPTIONAL = (handler) => {
  return async (req, res) => {
    let user;

    try {
      user = await exports.getUserByAuthHeader(req, res);
    } catch (err) {
      appErr.handleRouteServerErr(req, res, err, Logging, 'failed to query for user');
      return;
    }

    await handler(req, res, user);
  };
};

exports.DISABLED = (handler) => {
  return async (req, res) => {
    await handler(req, res);
  };
};

exports.getUserByAuthHeader = async (req, res) => {
    let user;

    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.match(/^OAuth \S+$/)) {
      return null;
    }

    const token = authHeader.slice(6);
    if (!token) {
      return null
    }

    try {
      user = await userDal.findByToken(token);
    } catch (err) {
      appErr.handleRouteServerErr(req, res, err, Logging, 'failed to query for user');
      return;
    }

    return user;
};
