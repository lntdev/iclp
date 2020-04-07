/**
 * These wrappers are intended to be wrapped by the token authentication wrapper and
 * receive the user object from it in the (req, res, user) signature seen below. Those
 * arguments are then passed on to the actual handler function if the user has sufficient
 * role membership. If the user lacks membership, the actual handler function is never
 * called and an error response is generated instead.
 */

const Logging = require('cccommon/logging').logger('shippingapi.auth.role');
Logging.enable();

const constant = require('cccommon/constant')
const appErr = require('this_pkg/error');

/**
 * @param {array|string} allowedRoleNamess One or more role names, e.g. 'Desk Agent'.
 * - See common/constant.js for valid names.
 */
exports.REQUIRED = (allowedRoleNames) => {
  return (handler) => {
    if (typeof allowedRoleNames === 'string') {
      allowedRoleNames = [allowedRoleNames];
    }
    if (!Array.isArray(allowedRoleNames)) {
      throw new Error('handler configured with invalid role selection, must be string or array');
    }
    allowedRoleNames.forEach(name => {
      if (!constant.role.name.exists(name)) {
        throw new Error(`handler configured with invalid role selection, [${name}] not found`);
      }
    });

    return async (req, res, user) => {
      if (!user) {
        throw new Error('user model not available for role auth check, handler may have been configured with required role(s) but the token requirement disabled');
      }

      const userRoleNames = []
      user.roles.forEach(role => {
        userRoleNames.push(role.name);
      });

      const rbacLogDetail = {
        allowedRoleNames: allowedRoleNames,
        userRoleNames: userRoleNames,
        userEmail: user.email,
        userId: user.get('id'),
        requestId: req.id,
        method: req.method,
        path: req.path
      };

      let match = false;
      userRoleNames.forEach(userRoleName => {
        if (allowedRoleNames.indexOf(userRoleName) !== -1) {
          match = true;
          return;
        }
      });

      if (!match) {
        rbacLogDetail.accessGranted = 'no';
        Logging.msg('User denied access to endpoint', rbacLogDetail);
        appErr.send(req, res, 'forbidden', constant.errMsg.notRoleMember(), {
          memberOf: userRoleNames,
          requireMembershipInOneOf: allowedRoleNames
        });
        return;
      }

      rbacLogDetail.accessGranted = 'yes';
      Logging.msg('User granted access to endpoint', rbacLogDetail);

      await handler(req, res, user);
    };
  }
};

exports.DISABLED = (handler) => {
  return async (req, res, user) => {
    await handler(req, res, user);
  };
};
