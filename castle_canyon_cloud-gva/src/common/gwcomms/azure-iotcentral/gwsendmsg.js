/*
  File: gwsendmsg.js 

  Description:
  Functionality to send messages to the gateway

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger('azure-iothub-gwsendmsg');
Logging.enable();

/* modules that are part of this tool's codebase */
const Commonconfig = require('cccommon/config');
const Northsouth = require('cccommon/northsouth');
const request = require('request');

module.exports = (options, deviceUuid, msg) => {
  return new Promise(async function(resolve, reject) {
    Logging.msg('N->S Message: ' + JSON.stringify(msg));
    var newDeviceProperties = updateProperties(deviceUuid, msg);
    if(newDeviceProperties == null) {
      reject('This N->S msg is not supported');
      return;
    }
    await setDeviceProperties (deviceUuid, newDeviceProperties)
      .then(async function (body){resolve(body); return})
      .catch(async function (err) {reject(err); retrurn})
  });
};

function updateProperties(deviceUuid, msg) {
  let requestedValue;
  switch(msg.data.msgType) {
    case Northsouth.southbound.msgids.startReceving:
      requestedValue = {
        shipmentId: parseInt(msg.data.JSON.shipmentId),
        shipmentState: 'End'
      };
      break;

    case Northsouth.southbound.msgids.channelChangeGateway:
      requestedValue = {
        wsnChannel: parseInt(msg.data.JSON.channelId)
      };
      break;

    case Northsouth.southbound.msgids.microIntervalChange:
      requestedValue = {
        microFrameInterval: parseInt(msg.data.JSON.microInterval)
      };
     break;

    case Northsouth.southbound.msgids.macroIntervalChange:
      requestedValue = {
        macroFrameInterval: parseInt(msg.data.JSON.macroInterval)
      };
     break;

    case Northsouth.southbound.msgids.airplaneMode:
      if(msg.data.JSON.airplaneMode && msg.data.JSON.reason == 'geofence') {
        requestedValue = {
          oceanGeofenceCellularStatusIndication: 'Breached;' + parseInt(msg.data.JSON.duration)
        };
      }
      else {
        Logging.msg('Airplane mode command not supported, only with geofence');
        return null;
      }
     break;

    case Northsouth.southbound.msgids.configchange:
     let configParams = msg.data.JSON.configList[0].configParams;
     let light = 0;
     let humidity = 1;
     let temperature = 2;
     let pressure = 3;
     let battery = 4;
     let shock = 5;
     let tilt = 6;
     requestedValue = {
        thresholds: {
            temperature:{
                state: configParams[temperature].enableSensor,
                min: parseInt(configParams[temperature].thresholds.min),
                max: parseInt(configParams[temperature].thresholds.max)
            },
            humidity:{
                state: configParams[humidity].enableSensor,
                min: parseInt(configParams[humidity].thresholds.min),
                max: parseInt(configParams[humidity].thresholds.max)
            },
            light:{
                state: configParams[light].enableSensor,
                max: parseInt(configParams[light].thresholds.max)
            },
            shock:{
                state: configParams[shock].enableSensor,
                max: parseInt(configParams[shock].thresholds.max)
            },
            tilt:{
                state: configParams[tilt].enableSensor,
                max: parseInt(configParams[tilt].thresholds.max)
            },
            battery:{
                state: configParams[battery].enableSensor,
                min: parseInt(configParams[battery].thresholds.min)
            },
            pressure:{
                state: configParams[pressure].enableSensor,
                min: parseInt(configParams[pressure].thresholds.min),
                max: parseInt(configParams[pressure].thresholds.max)
            }
        }
      };
      break;

    default:
      return null;
      break;
  }

  let deviceProperties = {};
  deviceProperties[Commonconfig.gwcomm.iotc_devcie_interface_id()] = {
    "iclpGwProperties": requestedValue
  };
  Logging.msg("updated Properties: " + JSON.stringify(deviceProperties));
  return deviceProperties;
}

/*
async function getDeviceProperties (deviceUuid) {
  return new Promise(async function (resolve, reject) {
    var requestOption = {
      url: Commonconfig.gwcomm.iotc_uri() + '/api/preview/devices/' + deviceUuid + '/properties',
      headers: {
        Authorization: 'SharedAccessSignature ' + Commonconfig.gwcomm.iotc_app_api_token()
      }
    };
    request.get(requestOption, async function (error, response, body) {
      if(body) body = JSON.parse(body);
      Logging.msg("getDeviceProperties Response: " + JSON.stringify(response));
      Logging.msg("getDeviceProperties Body: " + JSON.stringify(body));
      if (error) {
        reject("Error trying to getDeviceProperties " + error);
        return;
      }
      resolve(body);
    });
  });
}
*/
async function setDeviceProperties (deviceUuid, newDeviceProperties) {
  return new Promise(async function (resolve, reject) {
    var requestOption = {
      url: Commonconfig.gwcomm.iotc_uri() + '/api/preview/devices/' + deviceUuid + '/properties',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'SharedAccessSignature ' + Commonconfig.gwcomm.iotc_app_api_token()
      },
      json: newDeviceProperties
    };
    request.put(requestOption, async function (error, response, body) {
      Logging.msg("setDeviceProperties Response: " + JSON.stringify(response));
      Logging.msg("setDeviceProperties Body: " + JSON.stringify(body));
      if (error) {
        reject("Error trying to setDeviceProperties " + error);
        return;
      }
      resolve(body);
    });
  });
}

/******* For local Testing ********/
var N2S = { 
  properties: {
    northsouth_msgid: Northsouth.southbound.msgids.startReceving,
  },
  data: {
    msgType: Northsouth.southbound.msgids.startReceving,
    JSON: {
      time: Date.now(),
      gatewayId: '029830482304',
      shipmentId: 470
    }
  }
};

function localTest(){
  var result = module.exports(null, 'RealTestDevice05', N2S)
    .then(async function (res){Logging.msg("send message resp: " + JSON.stringify(res))})
    .catch(async function (rej){Logging.msg("send message err: " + rej)});
}
//localTest()
