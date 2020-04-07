/*
  File: createdevice.js

  Description:
  utility to create Iot Central device and generate the connection keys

  License:
  Intel TODO

*/
'use strict';

/* logging ..*/
const Logging   = require('cccommon/logging').logger("azure-iotcentral-createdevice");
Logging.enable();

const Commonconfig    = require('cccommon/config');
const IotCentral      = require('azure-iotcentral-device-client');

module.exports = async function (deviceUuid) {
    return new Promise(async function (resolve, reject){
        try {
            const scopeId = Commonconfig.gwcomm.iotc_scope_id();
            const sasMasterKey = Commonconfig.gwcomm.iotc_sas_master_key();
            const deviceTemplate = Commonconfig.gwcomm.iotc_devcie_template_id();

            const iotc = new IotCentral.IoTCClient(deviceUuid, scopeId, 'symm_key', sasMasterKey);
            iotc.setModelId(deviceTemplate);
            await iotc.register()
              .then(async function (iothubConnectionString){
                //Logging.msg("IotHub Connection String: " + iothubConnectionString);
                if (iothubConnectionString) {
                  var deviceCredentials = {
                    uri: iothubConnectionString.split(";")[0].replace("HostName=", ""),
                    deviceId: iothubConnectionString.split(";")[1].replace("DeviceId=", ""),
                    authentication: {
                      symmetricKey: {
                        primaryKey: iothubConnectionString.split(";")[2].replace("SharedAccessKey=", ""),
                        secondaryKey: iothubConnectionString.split(";")[2].replace("SharedAccessKey=", "")
                      }
                    },
                    connectionString: iothubConnectionString
                  };
                  resolve(deviceCredentials);
                } else
                  throw new Errror("iothubConnectionString was not null");
              })
              .catch(async function (err){
                Logging.msg("Error getting connection string: " + err);
                reject('getKey Error: ' + err);
              });
        }
        catch(e){
            Logging.msg("getKey Exception: " + e);
            reject(e);
        }
    });
}

function localTest(){
  var result = module.exports('gvaTestDevice010')
    .then(async function (res){Logging.msg("Device Created, key: " + JSON.stringify(res))})
    .catch(async function (rej){Logging.msg("Error Creating device: " + rej)});
}
//localTest()


/*
const Uuidlib    = require('uuid');
const IothubService   = require('azure-iothub');
const request = require("request");

module.exports = async function (deviceUuid) {
  return new Promise(async function (resolve, reject) {
    var requestBody = {
      '@type': 'Device',
      '@context': iotcUrl + '/api/preview/context/Device.json',
      displayName: deviceUuid,
      data: {},
      instanceOf: 'urn:iotc:modelDefinition:$unassigned',
      //instanceOf: iotCentralDeviceTemplate,
      deviceId: deviceUuid,
      simulated: false
    };
    var requestOption = {
      url: iotcUrl + '/api/preview/devices',
      headers: {
        Authorization: 'SharedAccessSignature ' + appAuthorizationKey
      },
      json: requestBody
    };
    request.post(requestOption, async function (error, response, body) {
      Logging.msg("createDevice Response: " + JSON.stringify(response));
      Logging.msg("createDevice Body: " + JSON.stringify(body));
      if (error) {
        reject("Error trying to createDevice: " + error);
        return;
      }
      if (response.statusCode == 201 || response.statusCode == 409) {
        await getDpsCredentails(deviceUuid)
          .then(async function(iothubConnectionString){
            var deviceCredentials = {
              uri: '',
              deviceId: '',
              primaryKey: '',
              secondaryKey: '',
              connectionString: ''
            };
            resolve(iothubConnectionString);
            return;
          })
          .catch(async function (err) {
            reject(err);
          });
      }
      else {
        reject("createDevice Error: " + response.statusCode);
        return;
      }
    });
  });
}

async function getDpsCredentails (deviceUuid) {
  return new Promise(async function (resolve, reject) {
    var requestOption = {
      url: iotcUrl + '/api/preview/devices/' + deviceUuid + '/credentials',
      headers: {
        Authorization: 'SharedAccessSignature ' + appAuthorizationKey
      },
    };
    request.get(requestOption, async function (error, response, body) {
      body = JSON.parse(body);
      Logging.msg("getDpsCredentails Response: " + JSON.stringify(response));
      Logging.msg("getDpsCredentails Body: " + JSON.stringify(body));
      if (error) {
        reject("Error trying to getDpsCredentails: " + error);
        return;
      }
      if (response.statusCode == 200) {
        await getKey(deviceUuid, body)
          .then(async function (iothubConnectionString){
            resolve(iothubConnectionString);
            return;
          })
          .catch(async function(err){
            reject(err);
            return;
          });
      }
      else {
        reject("getDpsCredentails Error: " + response.statusCode);
        return;
      }
    });
  });
}
*/
