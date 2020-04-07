/*
  File: deletedevice.js

  Description:
  utility to delete Azure Iot hub  device

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
    //TODO: to be implemented;; (not really required for IOT HUB)
    // trying to maintian common interface between hub and central
 
    resolve();
  });
}
