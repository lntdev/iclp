/*
  File: deletedevice.js

  Description:
  utility to delete Iot Central device

  License:
  Intel TODO

*/
'use strict';

/* logging ..*/
const Logging   = require('cccommon/logging').logger("azure-iotcentral-deletedevice");
Logging.enable();

const Commonconfig    = require('cccommon/config');
const request         = require('request');


module.exports = async function (deviceUuid) {
  return new Promise(async function (resolve, reject) {
    var requestOption = {
      url: Commonconfig.gwcomm.iotc_uri() + '/api/preview/devices/' + deviceUuid,
      headers: {
        Authorization: 'SharedAccessSignature ' + Commonconfig.gwcomm.iotc_app_api_token()
      }
    };
    request.delete(requestOption, async function (error, response, body) {
      if(body) body = JSON.parse(body);
      Logging.msg("deleteDevice Response: " + JSON.stringify(response));
      Logging.msg("deleteDevice Body: " + JSON.stringify(body));
      if (error || response.statusCode >= 400) {
        reject("Error trying to delete device: " + error);
        return;
      }
      resolve(body);
    });
  });
}

function localTest(){
  var result = module.exports('gvaTestDevice010')
    .then(async function (res){Logging.msg("Device Deleted: " + res)})
    .catch(async function (rej){Logging.msg("Unable to delete device: " + rej)});
}
//localTest()
