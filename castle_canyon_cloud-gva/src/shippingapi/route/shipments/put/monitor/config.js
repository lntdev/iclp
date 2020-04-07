const Logging = require('cccommon/logging').logger('shippingapi.route.shipment.put.monitor.config');
Logging.enable();

const dal = require('cccommon/dal');
const shipDal = dal.shipment;
const statusConst = require('cccommon/constant').status;
const appErr = require('this_pkg/error');
const gwmClient = require('cccommon/client/gwmessenger');
const hooks = require('this_pkg/hooks');

module.exports = async (req, res, user, shipment) => {
  let transaction;
  let options;

  try {
    if (shipment.status !== statusConst.inMonitoring()) {
      appErr.send(
        req, res, 'status_conflict',
        'Monitoring configuration cannot be changed in the shipment\'s current status.',
        {
          currentStatus: shipment.status,
          requiredStatus: statusConst.inMonitoring()
        }
      );
      return;
    }

    const spec = req.body;

    const valErrs = exports.validateSpec(shipment, spec);
    if (valErrs.length) {
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
      return;
    }

    transaction = await dal.getTransaction();
    options = { transaction: transaction };

    await shipDal.changeMonitorConfig(shipment, spec, options);

    // Reminder: if an HTTP request to the gwmessenger fails for any reason, we want that
    // error to bubble up, trigger a rollback, and cause a 500 response to the client
    // (Visibility Portal). This will effectively let the Desk Agent know the operation
    // needs to be attempted again, because in that scenario we're confident that the GW
    // never received the message.
    var result = await gwmClient.configChange(req, shipment.get('id'));
    Logging.msg("result: " + JSON.stringify(result));
    if (result.status != 200) {
      let reason = JSON.parse(result.response.text);
      Logging.msg("text: " + JSON.stringify(reason.details.name));
      res.status(202).send({ Error: reason.details.name });
      return;
    }
    await transaction.commit();
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }

    appErr.handleRouteServerErr(req, res, err, Logging, 'failed to change shipment monitor config');

    return;
  }

  res.status(204).send();
};

exports.validateSpec = (shipment, spec) => {
  const valErrs = [];

  function present(v) {
    return v && v != '';
  }

  if (spec.tag2GwReportingTime && spec.tag2GwReportingTime === '') {
    valErrs.push({ 'tag2GwReportingTime': 'empty value, omit to avoid update attempt' });
  }
  if (spec.gw2CloudReportingTime && spec.gw2CloudReportingTime === '') {
    valErrs.push({ 'gw2CloudReportingTime': 'empty value, omit to avoid update attempt' });
  }

  if (spec.shippingUnits.length !== shipment.shippingUnitCount) {
    valErrs.push({ 'shippingUnits': `received ${spec.shippingUnits.length}, expected ${shipment.shippingUnitCount}` });
    return valErrs;
  }

  spec.shippingUnits.forEach((shippingUnit, su) => {
    if (!present(shippingUnit.id)) {
      const key = `spec.shippingUnit[${su}].id`;
      const ve = {};
      ve[key] = 'missing/empty';
      valErrs.push(ve);
      return;
    }

    if (!Array.isArray(shippingUnit.tags) || shippingUnit.tags.length === 0) {
      const key = `spec.shippingUnit[${su}].tags`;
      const ve = {};
      ve[key] = 'missing/empty';
      valErrs.push(ve);
      return;
    }

    shippingUnit.tags.forEach((tag, t) => {
      if (!present(tag.id)) {
        const key = `spec.shippingUnit[${su}].tags[${t}].id`;
        const ve = {};
        ve[key] = 'missing/empty';
        valErrs.push(ve);
        return;
      }

      if (!present(tag.thresholds)) {
        const key = `spec.shippingUnit[${su}].tags[${t}].thresholds`;
        const ve = {};
        ve[key] = 'missing/empty';
        valErrs.push(ve);
        return;
      }
    });
  });

  return valErrs;
};
