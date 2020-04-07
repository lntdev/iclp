/*
  File: index.js

  Description:
  utility to access the keystore

  License:
  Intel TODO

*/
'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("common-keystore");
Logging.enable();
const Commonconfig = require('cccommon/config');
const request = require("request");

module.exports = async function (deviceUuid, shipmentId, gvaUrl, deviceCredentials, provisionData) {
  return new Promise(function (resolve, reject) {
    var requestBody = {
      deviceUuid: deviceUuid,
      shipmentId: shipmentId || null,
      gvaId: gvaUrl || null,
      deviceCredentials: deviceCredentials || null,
      provisionData: provisionData || {}
    };
    var requestOption = {
      url: Commonconfig.deviceKeystore.uri() + 'keystore/updateDeviceRecord/',
      headers: {
        'Content-Type': 'application/json',
      },
      json: requestBody
    };
    request.post(requestOption, function (error, response, body) {
      //Logging.msg("Response: " + JSON.stringify(response));
      //Logging.msg("Body: " + JSON.stringify(body));
      if (error) {
        reject("Error with keystore: " + error);
        return;
      }
      if (response.statusCode == 200) {
        resolve();
        return;
      } else {
        reject("Error: " + response.statusCode);
        return;
      }
    });
  });
}
