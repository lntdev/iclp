const Logging = require('cccommon/logging').logger('shippingapi.route.shipment.put.monitor');
Logging.enable();

const request = require('request-promise');
const config = require('cccommon/config/config');
const dal = require('cccommon/dal');
const shipDal = dal.shipment;
const statusConst = require('cccommon/constant').status;
const appErr = require('this_pkg/error');
const statusHelper = require('this_pkg/shipment/status');
const hooks = require('this_pkg/hooks');
const idgen = require('cccommon/idgen/idgen');

module.exports = async (req, res, user, shipment) => {
  const fromStatus = shipment.status;
  let transaction;
  let options;
  try {
    const spec = req.body;

    transaction = await dal.getTransaction();
    options = {transaction: transaction};

    const valErrs = await exports.validateSpec(shipment, spec, options);
    if (valErrs.length) {
      if (transaction) await transaction.rollback();
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
      return;
    }

    await shipDal.updateStatus(shipment, statusConst.inMonitoring(), options);
    await shipDal.initMonitorConfig(shipment, spec, options);
    await transaction.commit();

  } catch(err) {
    if (transaction) await transaction.rollback();
    appErr.handleRouteServerErr(req, res, err, Logging, 'failed to change shipment status');
    return;
  }

  statusHelper.logTransitionSuccess(req, Logging, user, shipment, fromStatus, statusConst.inMonitoring());

  //compose the response
  var response = {};
  Logging.msg("response: " + JSON.stringify(response));
  res.status(202).send(response);
};

exports.validateSpec = async (shipment, spec, options) => {
  const valErrs = [];
  function present(v) {
    return v && v != '';
  }

  if (!Array.isArray(spec.shippingUnits) || spec.shippingUnits.length === 0) {
    valErrs.push({'shippingUnits': 'missing/empty'});
    return valErrs;
  }

  if (spec.shippingUnits.length !== shipment.shippingUnitCount) {
    valErrs.push({'shippingUnits': `received ${spec.shippingUnits.length}, expected ${shipment.shippingUnitCount}`});
  }

  for (let su in spec.shippingUnits) {
    const shippingUnit = spec.shippingUnits[su];

    if (!present(shippingUnit.unitId)) {
      const key = `spec.shippingUnit[${su}].unitId`;
      const ve = {};
      ve[key] = 'missing/empty';
      valErrs.push(ve);
    }

    if (!present(shippingUnit.tagId)) {
      const key = `spec.shippingUnit[${su}].tagId`;
      const ve = {};
      ve[key] = 'missing/empty';
      valErrs.push(ve);
      return valErrs;
    } else {
      const key = `spec.shippingUnit[${su}].tagId`;
      const tagConflicts = await shipDal.findByTagUUID(shippingUnit.tagId, options);
      if (tagConflicts.length) {
        let shipIds = [];
        for (let ship of tagConflicts) {
          shipIds.push(ship.get('id'));
        }
        // DECEMBER HACK: while DB unique constraints have been off, multiple conflicts may have accrued.
        shipIds = shipIds.join(', ');
        const ve = {};
        ve[key] = `tag [${shippingUnit.tagId}] is in use by shipment [ID: ${shipIds}]`;
        valErrs.push(ve);
      }
    }
  }

  return valErrs;
};
