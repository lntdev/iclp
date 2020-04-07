const Logging = require('cccommon/logging').logger('shippingapi.route.session.delete');
Logging.enable();

const userDal = require('cccommon/dal/user');
const appErr = require('this_pkg/error');

exports.handler = async (req, res, user) => {
  if (user) {
    try {
      await userDal.destroyToken(user);
    } catch (err) {
      appErr.handleRouteServerErr(req, res, err, Logging, 'failed to destroy user\'s token for logout');
      return;
    }
  }

  res.status(204).send();
};
