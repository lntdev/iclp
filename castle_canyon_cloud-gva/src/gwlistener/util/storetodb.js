/*
  File: storeToDd.js

  Description:
  Stores data in MongoDB

  License:
  Intel TODO

*/
'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("gwlistener.storeToDb");
Logging.enable();

/* gva common mondules */
const sensorDal = require('cccommon/dal/sensordata');
const Commonconfig = require('cccommon/config');

//store any kind of Tag Sensor Data into DB.
module.exports = function (sensorData) {
    // check if the process in VM flag is enabled,,
    //Logging.msg('storeToDb: ' + JSON.stringify(sensorData));
    var result = false;
    if (Commonconfig.gwlistener.store_data() == 'enable') {
        result = sensorDal.insertTagSensorData(sensorData);
    } else {
        result = "Storage of GW data has been disabled";
    }
    return result;
}
