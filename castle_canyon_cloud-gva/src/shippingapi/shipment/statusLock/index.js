const Logging = require('cccommon/logging').logger('shippingapi.shipment.statusLock');
Logging.enable();

const statusConst = require('cccommon/constant').status;
const appErr = require('this_pkg/error');

exports.validateOwner = (handler) => {
  return async (req, res, user, shipment) => {
    if (!user) {
      throw new Error('user model not available for status lock validation, handler may have been misconfigured with the validation wrapper');
    }
    if (!shipment) {
      throw new Error('shipment model not available for status lock validation, handler may have been misconfigured with the validation wrapper');
    }

    if(false) { //TODO: temp hack to enable non-Obt flow
    //if (shipment.statusLockUserId && shipment.statusLockUserId !== user.get('id')) {
      exports.logOwnerValidationFailure(req, Logging, user, shipment, shipment.statusLockUser);

      appErr.send(
        req, res, 'status_transition_forbidden',
        'Shipment status is locked by another user',
        {
          lockOwner: shipment.statusLockUser.email
        }
      );
      return;
    }

    exports.logOwnerValidationSuccess(req, Logging, user, shipment, shipment.statusLockUser);

    await handler(req, res, user, shipment);
  };
};

exports.logOwnerValidation = (result, req, logger, user, shipment, ownerUser) => {
  const details = {
    result: result,
    sessionUserId: user.get('id'),
    sessionUserEmail: user.email,
    requestId: req.id
  };

  if (ownerUser) { // will be null when "unlocked"
    details.ownerUserId = ownerUser.get('id');
    details.ownerUserEmail = ownerUser.email;
  }

  logger.msg(`shipment status lock-owner validation: ${result}`, details);
};

exports.logOwnerValidationSuccess = (req, logger, user, shipment, ownerUser) => {
  exports.logOwnerValidation('success', req, logger, user, shipment, ownerUser);
};

exports.logOwnerValidationFailure = (req, logger, user, shipment, ownerUser) => {
  exports.logOwnerValidation('failure', req, logger, user, shipment, ownerUser);
};
