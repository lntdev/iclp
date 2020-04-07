const Logging = require('cccommon/logging').logger('shippingapi.shipment.status');
Logging.enable();

const shipFsm = require('cccommon/shipment/fsm');
const appErr = require('this_pkg/error');

/**
 * @param {array} offeredTransitions One or more states to which the current endpoint may transition
 * the shipment. Each element is an object with two required keys:
 * - {string} from Origin status
 * - {string} to Destination status
 */
exports.validateTransition = (offeredTransitions) => {
  return (handler) => {
    return async (req, res, user, shipment) => {
      if (!shipment) {
        throw new Error('shipment model not available for transition validation, handler may have been misconfigured with the validation wrapper');
      }

      if (!Array.isArray(offeredTransitions)) {
        throw new Error('failed to validate shipment transition, handler was misconfigured, array of transitions is missing');
      }

      let validTrans;

      for (let trans of offeredTransitions) {
        if (!trans.from || trans.from === '') {
          throw new Error('failed to validate shipment transition, from-state is missing/empty');
        }
        if (!trans.to || trans.to === '') {
          throw new Error('failed to validate shipment transition, to-state is missing/empty');
        }

        if (!shipFsm.validateState(trans.from)) {
          throw new Error(`failed to validate shipment transition, from-state [${trans.from}] was not found in FSM`);
        }
        if (!shipFsm.validateState(trans.to)) {
          throw new Error(`failed to validate shipment transition, to-state [${trans.to}] was not found in FSM`);
        }

        if (shipment.status === trans.to) { // Enforce idempotency
          exports.logTransitionSkip(req, Logging, user, shipment, shipment.status, trans.to);
          res.status(204).send();
          return;
        }

        if (shipment.status !== trans.from) {
          continue;
        }

        if (!shipFsm.validateTransition(trans.from, trans.to)) {
          throw new Error(`failed to validate shipment transition, handler misconfigured with illegal offered transition from [${trans.from}] to [${trans.to}]`);
        }

        validTrans = trans;
        break;
      }

      if (!validTrans) {
        // No legal transition found, return an error.
        appErr.send(
          req, res, 'status_transition_invalid',
          'Shipment cannot transition to any status offered by this endpoint',
          {
            currentStatus: shipment.status,
            offeredTranssitions: offeredTransitions
          }
        );
        return;
      }

      await handler(req, res, user, shipment);
    };
  };
};

exports.logTransition = (result, req, logger, user, shipment, fromStatus, toStatus) => {
  logger.msg(`shipment transition: ${result}`, {
    result: result,
    userId: user.get('id'),
    userEmail: user.email,
    requestId: req.id,
    fromStatus: fromStatus,
    toStatus: toStatus,
    shipmentPrimaryKeyId: shipment.get('id')
  });
};

exports.logTransitionSkip = (req, logger, user, shipment, fromStatus, toStatus) => {
  exports.logTransition('skip', req, logger, user, shipment, fromStatus, toStatus);
};

exports.logTransitionSuccess = (req, logger, user, shipment, fromStatus, toStatus) => {
  exports.logTransition('success', req, logger, user, shipment, fromStatus, toStatus);
};

exports.logTransitionFailure = (req, logger, user, shipment, fromStatus, toStatus) => {
  exports.logTransition('failure', req, logger, user, shipment, fromStatus, toStatus);
};
