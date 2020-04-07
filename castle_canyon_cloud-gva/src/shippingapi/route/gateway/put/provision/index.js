const Logging = require('cccommon/logging').logger('shippingapi.route.gateway.put.provision');
Logging.enable();

const dal = require('cccommon/dal');
const shipDal = dal.shipment;
const gwDal = require('cccommon/dal/gateway');
const statusConst = require('cccommon/constant').status;
const appErr = require('this_pkg/error');
const statusHelper = require('this_pkg/shipment/status');
const createDevice = require('cccommon/gwcomms').createGwDevice;
const updateDeviceRecord = require('cccommon/keystore');
const GwComms = require('cccommon/gwcomms');
const idgen = require('cccommon/idgen/idgen');

exports.handler = async (req, res, user) => {
  let returnError = null;
  try {
    const valErrs = await exports.validateSpec(req.body);
    if (valErrs.length) {
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
      return;
    }

    // add the gw details to the internal db
    let spec = format(req.body);
    await gwDal.gatewayUpcert(spec)
      .then((msg) => Logging.msg('Added GW to Internal DB: ' + JSON.stringify(msg)))
      .catch((msg) => Logging.msg('Error Unable to add GW to Internal DB: ' + JSON.stringify(msg)));

    // try and delete the existing gateway
    await GwComms.deleteGwDevice(req.body.gatewayId)
      .then(function (msg) { Logging.msg("GW device deleted") })
      .catch(function (msg) { Logging.msg("GW device could not be deleted") })

    // first get auth keys for the gateway
    await createDevice(req.body.gatewayId)
      .then(async function (result) {
        Logging.msg("Device created: " + JSON.stringify(result));
        var connectionString =
          "HostName=" + result.uri + ";" +
          "DeviceId=" + result.deviceId + ";" +
          "SharedAccessKey=" + result.authentication.symmetricKey.primaryKey;
        var deviceCredentials = {
          uri: result.uri,
          deviceId: result.deviceId,
          primaryKey: result.authentication.symmetricKey.primaryKey,
          secondaryKey: result.authentication.symmetricKey.secondaryKey,
          connectionString: connectionString
        }

        let provisionData = require('./provisiondata');
        provisionData.provisionData.gatewayId = req.body.gatewayId;
        provisionData.provisionData.gatewayWSNId = req.body.gatewayWsnId;
        provisionData.provisionData.channelId = req.body.channelId;
        provisionData.provisionData.PANId = req.body.panId;
        provisionData.provisionData.macroInterval = req.body.macroInterval;
        provisionData.provisionData.microInterval = req.body.microInterval;

        await updateDeviceRecord(
          req.body.gatewayId,
          null,
          req.protocol + '://' + req.headers.host,
          deviceCredentials,
          provisionData
        )
          .then(function (result) {
            Logging.msg("Keystore has been updated!!");
            return true;
          })
          .catch(function (error) {
            returnError += "Error while trying to update Keystore: " + error + ";";
            Logging.msg(returnError);
            return false;
          });
      })
      .catch(function (error) {
        if (error) {
          returnError += "error creating device: " + error + ";";
          Logging.msg(returnError);
          return false;
        }
      });
    if (returnError) {
      appErr.send(req, res, 'other', ["there was and error when tyring to reigster gw device"]);
      return;
    }
    res.status(204).send();
    return;
  } catch (error) {
    returnError += "Provision shipment Error: " + error + ";";
    Logging.msg(returnError);
    appErr.handleRouteServerErr(req, res, returnError, Logging, 'Failed to provision the Gateway');
    return;
  }
}

function format(body) {
  let spec = {};
  spec.uuid = body.gatewayId;
  spec.wsnId = body.gatewayWsnId;
  spec.panId = body.panId;
  spec.channelId = body.channelId;
  spec.microInterval = body.microInterval;
  spec.macroInterval = body.macroInterval;
  spec.beaconKey = idgen.get_common_beacon_key();
  return spec;
}
exports.validateSpec = async (spec) => {
  const valErrs = [];

  function present(v) {
    return v && v != '';
  }

  if (!spec.gatewayId || spec.gatewayId.length === 0) {
    valErrs.push({ gatewayId: 'missing or empty' });
  }

  if (!spec.gatewayWsnId || spec.gatewayWsnId < 0 || spec.gatewayWsnId > 65535) {
    valErrs.push({ gatewayWsnId: 'missing, empty or should a value between 0-65535' });
  }

  if (!spec.panId || spec.panId < 0 || spec.panId > 65535) {
    valErrs.push({ panId: 'missing or empty or should be a value between 0-65535' });
  }

  if (!spec.channelId || spec.channelId < 5 || spec.channelId > 25) {
    valErrs.push({ channelId: 'missing, empty or value should be between 11-25' });
  }

  if (!spec.macroInterval || spec.macroInterval < 30 || spec.macroInterval > 86400) {
    valErrs.push({ macroInterval: 'missing, empty or out of range ie. 30 - 86400 seconds' });
  }

  if (!spec.microInterval || spec.microInterval < 6 || spec.microInterval > 86400) {
    valErrs.push({ microInterval: 'missing, empty or out of range ie. 6 - 86400 seconds' });
  }

  if (spec.macroInterval % spec.microInterval) {
    valErrs.push({ macroInterval: 'the macroInterval needs to be a whole multiple of micro interval' });
  }
  return valErrs;
}
