const Logging = require('cccommon/logging').logger('shippingapi.route.gateway.post.uploadDiagnostic');
Logging.enable();

const gwmClient = require('cccommon/client/gwmessenger');
const dal = require('cccommon/dal');
const shipDal = dal.shipment;
const appErr = require('this_pkg/error');


exports.handler = async(req, res, user) => {
    const successStatus = 200;
    const gatewayId = req.params.id;
    const connStr = req.body.diagnosticBlobConnectionString;

    try {
      let spec = req.body;
       const valErrs = validateSpec(spec);
        if (valErrs.length) {
            appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
            return;
        }
      Logging.msg("GW id for diagnostic config " + gatewayId);
      Logging.msg("Connection String " + connStr);
      var result = await gwmClient.uploadDiagnosticConfig(req, gatewayId);

      if (result.status != 200) {
        Logging.msg("res: " + JSON.stringify(result));
        res.status(202).send({
          Error: "Gateway was not found in GVA DB, unable to upload Connection String!"
        });
        return;
      }
      else {
        res.status(successStatus).send("Data send successfully to the device!!");
        return;
      }
    } catch (findErr) {
      appErr.handleRouteServerErr(req, res, findErr, Logging, 'failed');
    }
}


function validateSpec(spec) {
  const valErrs = [];

  function present(v) {
    return Object.keys(v).length && v.diagnosticBlobConnectionString != '';
  }

  if (!present(spec)) {
    valErrs.push({
      diagnosticBlobConnectionString: 'missing/empty'
    });
  }

  return valErrs;
}

