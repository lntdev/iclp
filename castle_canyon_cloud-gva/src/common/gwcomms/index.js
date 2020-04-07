/*
  File: index.js

  Description:
  abstraction layer, to differentiate between the various gw comm
  methods.. allow for various cloud vendors and comm methods to 
  be implemented.

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging   = require('cccommon/logging').logger('gwcomms/index');
Logging.enable();

/* modules that are part of this tool's codebase */
const gwCommMethod = require('cccommon/config').gwcomm.method();
var createDevice;
var gwSendMsg;
var gwReceive;
var deleteDevice;

if (gwCommMethod == 'azure-iothub'){
    Logging.msg('Initilizing GW Comms Method to: ' + gwCommMethod);
    createDevice = require('./azure-iothub/createdevice');
    gwSendMsg = require('./azure-iothub/gwsendmsg');
    gwReceive = require('./azure-iothub/gwreceive');
    deleteDevice = require('./azure-iothub/deletedevice');
} else if (gwCommMethod == 'azure-iotcentral'){
    Logging.msg('Initilizing GW Comms Method to: ' + gwCommMethod);
    createDevice = require('./azure-iotcentral/createdevice');
    gwSendMsg = require('./azure-iotcentral/gwsendmsg');
    gwReceive = require('./azure-iotcentral/gwreceive');
    deleteDevice = require('./azure-iotcentral/deletedevice');
} else {
    err = 'Unsupported or undefined GW Communication Method: ' + gwCommMethod;
    Logging.msg(err);
    throw new Error(err);
}

exports.createGwDevice = function (deviceUuid){
    return createDevice(deviceUuid);
}

exports.sendGwMsg = function(options, deviceUuid, msg){
    return gwSendMsg(options, deviceUuid, msg);
}

exports.receiveGwMsgs = function(options){
    return gwReceive(options);
}

exports.deleteGwDevice = function (deviceUuid){
    return deleteDevice(deviceUuid);
}
