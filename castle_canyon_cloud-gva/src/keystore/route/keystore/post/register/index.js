const Logging = require('cccommon/logging').logger('keystore.route.keystore.post.register');
Logging.enable();
const format = require('cccommon/format');
const appErr = require('this_pkg/error');
const keystoreDal = require('cccommon/dal/keystore');
const request = require('request-promise');

exports.handler = async (req, res, user) => {
    try {
        let spec = req.body;

        const valErrs = exports.validateSpec(spec);
        if (valErrs.length) {
          appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
          return;
        }
        let uuid = spec.deviceUuid || spec.gatewayUUID;
        keystoreDal.findByUuid(uuid, async function (err, data) {
            if (err) {
                Logging.msg("Unable to find UUID in Database: " + err);
                appErr.send(req, res, 'other', 'Unable to find UUID in Database:', [uuid]);
                return;
            }
            Logging.msg('keystore record: ' + data);
            let provisionData;
            let deviceConnectionCredentials;
            try {
              provisionData = JSON.parse(data.provisionData);
              deviceConnectionCredentials = JSON.parse(data.deviceConnectionCredentials) || {};
            } catch (e) {
                Logging.msg('error: ' + e);
                appErr.send(req, res, 'other', 'Unable to find UUID in Database:', [uuid]);
                return;
            }
            let azureDeviceCredentials = {};
            if (Object.keys(deviceConnectionCredentials).length) {
              Logging.msg("device Cred: " + JSON.stringify(deviceConnectionCredentials));
              azureDeviceCredentials.uri = deviceConnectionCredentials.uri;
              azureDeviceCredentials.deviceId = deviceConnectionCredentials.deviceId;
              azureDeviceCredentials.primaryKey = deviceConnectionCredentials.primaryKey;
              azureDeviceCredentials.secondaryKey = deviceConnectionCredentials.secondaryKey;
              azureDeviceCredentials.connString = deviceConnectionCredentials.connectionString;
            }
            let response = {
              gatewayUuid: data.deviceUuid,
              provisionData: provisionData,
              connectionCredentials: {
                deviceCredentials: {
                  cloudType: "azure",
                  azure: azureDeviceCredentials
               }
             }
            }
            res.status(201).send(response);
            return;
        });
    } catch (findErr) {
        appErr.handleRouteServerErr(req, res, findErr, Logging, 'REST API execution error!');
    }

};


exports.validateSpec = (spec) => {
  const valErrs = [];

  function present(v) {
    return v && v != '';
  }

  if (!present(spec.deviceUuid) && !present(spec.gatewayUUID)) {
    valErrs.push({deviceUuid: 'missing/empty'});
  } //else if (spec.deviceUuid.length != 32) {
    //valErrs.push({deviceUuid: 'Invalid: does not match UUID type creteria'});
  //}
  return valErrs;
}

getAuthKey = async function (url, token, uuid, shipmentId) {
    var req_body = {
        deviceUuid: uuid,
        geEcdhPublicKey: null,
        obtEcdsaPublicKey: null
    };
    var req_options = {
        url: url + '/shipments/authenticate/' + shipmentId,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'OAuth ' + token
        },
        json: req_body
    };
    try {
        var result = await request(req_options);
        Logging.msg("/shipments/authenticate result: " + JSON.stringify(result));
        return {
            status: "pass",
            ret: result
        };
    } catch (err) {
        Logging.msg("Error while trying to POST /shipments/authenticate:" + err);
        return {
            status: "fail",
            ret: err
        };
    }
}

getShipmentDetails = async function (url, token, uuid) {
    var req_body = {
      "gateways": [uuid],
      "tags": []
    }
    var req_options = {
        url: url + '/shipments/0/provision/verify', //use shipmentId=0 here
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'OAuth ' + token
        },
        json: req_body
    };
    try {
        var result = await request(req_options);
        Logging.msg("/provision/verify result: " + JSON.stringify(result));
        return {
            status: "pass",
            ret: result
        };
    } catch (err) {
        Logging.msg("Error while trying to POST /provision/verify:" + err);
        return {
            status: "fail",
            ret: err
        };
    }
}

getAuthToken = async function (url) {
    var req_body = {
        username: 'dockworker@localhost',
        password: 'dockworker',
        role: 'Dock Worker'
    };
    var req_options = {
        url: url + '/session',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: req_body
    };
    try {
        var result = await request(req_options);
        Logging.msg("/session result: " + JSON.stringify(result));
        return {
            status: "pass",
            ret: result
        };
    } catch (err) {
        Logging.msg("Error while trying to POST /session:" + err);
        return {
            status: "fail",
            ret: err
        };
    }
}
