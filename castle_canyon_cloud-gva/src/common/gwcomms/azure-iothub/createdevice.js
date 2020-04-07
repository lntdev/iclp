/*
  File: auth.js

  Description:
  utility to create iothub device keys

  License:
  Intel TODO

*/
'use strict';

/* logging ..*/
const Logging   = require('cccommon/logging').logger("azure-iothub-createdevice");
Logging.enable();

const Commonconfig    = require('cccommon/config');
const IothubService   = require('azure-iothub');
const Uuidlib    = require('uuid');

module.exports = function (deviceUuid) {
    return new Promise(function (resolve, reject) {
        var deviceregistry = IothubService.Registry.fromConnectionString(
            Commonconfig.gwcomm.iothub_service_policy_connect_str()
        );
        var device = new IothubService.Device(null);
        device.deviceId = deviceUuid;
        deviceregistry.get(device.deviceId, function (err, deviceObj) {
            if (err) {
                if (err.name == 'DeviceNotFoundError') {
                    device.status = "enable";
                    device.authentication = {};
                    device.authentication.symmetricKey = {};
                    device.authentication.symmetricKey.primaryKey = new Buffer(Uuidlib.v4()).toString('base64');
                    device.authentication.symmetricKey.secondaryKey = new Buffer(Uuidlib.v4()).toString('base64');
                    deviceregistry.create(device, function (err, deviceObj) {
                        if (err) {
                            Logging.msg("error createing new GW device: " + err.name)
                            reject(err);
                            return;
                        } else {
                            Logging.msg("Successfully created a new GW device");
                            deviceObj.uri = deviceregistry._restApiClient._config.host;
                            resolve(deviceObj);
                            return;
                        }
                    })
                } else {
                    Logging.msg("Unhandled error: " + err.name);
                    reject(err);
                    return;
                }
            } else {
                Logging.msg("Gw Device already exists ");
                deviceObj.uri = deviceregistry._restApiClient._config.host;
                resolve(deviceObj);
                return;
            }
        });
    });
}
