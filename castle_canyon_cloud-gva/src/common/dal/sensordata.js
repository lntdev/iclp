/*
  File: sensordata.js

  Author: sharath.srinivasan@intel.com

  Description:
  storage of sensor data in external database

  License:
  Intel TODO

*/

'use strict';

const Logging = require('cccommon/logging').logger('common.dal.sensordata');
Logging.enable();
const Commonconfig = require('cccommon/config');
const Mongoose = require('mongoose');
const Northsouth = require('cccommon/northsouth');

Mongoose.connect(Commonconfig.externaldb.uri(), Commonconfig.externaldb.auth())
  .then(() => console.log('Successfully connected to the externalDB (MongoDB)...'))
  .catch((err) => console.error("Error connecting to externalDB: " + err));

var tagSensorDataSchema = new Mongoose.Schema(require('cccommon/models/externaldb/tagsensordata').tagSensorDataSchema);
var addTagRequestSchema = new Mongoose.Schema(require('cccommon/models/externaldb/addtagrequest').addTagRequestSchema);
var addTagResponseSchema = new Mongoose.Schema(require('cccommon/models/externaldb/addtagresponse').addTagResponseSchema);

var tagSensorDataModel = Mongoose.model('tagsensordata', tagSensorDataSchema, 'sensordata');
var addTagRequestModel = Mongoose.model('addtagrequest', addTagRequestSchema, 'sensordata');
var addTagResponseModel = Mongoose.model('addtagresponse', addTagResponseSchema, 'sensordata');

exports.deleteByShipmentId = (shipmentId, callback) => {
  tagSensorDataModel.remove({ 'shipmentId': shipmentId.toString() }, function (err, data) {
    if (err) { Logging.msg(err, data); return; }
    //Logging.msg("SensorData DAL: " + data);
    callback(null, data.n);
  })
}

exports.getLastRecord = (callback) => {
  tagSensorDataModel.findOne({}, {}, { sort: { receivedTime: -1 } }, function (err, data) {
    if (err) { Logging.msg('Error: ' + err); callback(err, null); return }
    //Logging.msg('Last SensorData: ' + data);
    callback(null, data);
    return;
  });
}

exports.getLastRecordforTagId = async (tagId, callback) => {
  const query1 = tagSensorDataModel.findOne({ tagId: tagId }, {}, { sort: { cloudReceivedTime: -1 } });
  const result = await query1.exec();
  //Logging.msg('Last SensorData: ' + result);
  return result;
}

exports.insertTagSensorData = async (sensorData) => {
  //Logging.msg('insertTagSensorData: ' + JSON.stringify(sensorData));
  return new Promise(function (resolve, reject) {
    var newSensorData = new tagSensorDataModel(sensorData);
    newSensorData.save(function (err) {
      if (err) {
        Logging.msg("Error: " + err);
        reject('Error: Saving Tag Sensor Data into externalDB');
      }
      Logging.msg("Saved the Tag sensordata. Tag Id : " + sensorData.tagId +
        ", Shipment ID : " + sensorData.shipmentId +
        ", TagCapturedTime : " + sensorData.tagCapturedTime + "");
      resolve(null);
    });
  });
}

const anomaliesCriteria = [
  { lost: true },
  { batteryAnomaly: true },
  { temperatureAnomaly: true },
  { humidityAnomaly: true },
  { shockAnomaly: true },
  { tiltAnomaly: true },
  { lightAnomaly: true },
  { pressureAnomaly: true }
];

exports.findByTagId = (shipmentId, tagId, onlyAnomalies, callback) => {
  let searchCriteria = {
    'shipmentId': shipmentId.toString(),
    'tagId': tagId.toString()
  };

  if (onlyAnomalies)
    searchCriteria.$or = anomaliesCriteria;

  tagSensorDataModel.find(searchCriteria, {}, { sort: { cloudReceivedTime: -1 } }, function (err, data) {
    if (err) { Logging.msg(err, data); return; }
    //Logging.msg("SensorData DAL: " + data);
    callback(null, data);
  })
}

exports.findByPackageId = (shipmentId, packageId, onlyAnomalies, callback) => {
  let searchCriteria = {
    'shipmentId': shipmentId.toString(),
    'packageId': packageId.toString()
  };

  if (onlyAnomalies)
    searchCriteria.$or = anomaliesCriteria;

  tagSensorDataModel.find(searchCriteria, {}, { sort: { cloudReceivedTime: -1 } }, function (err, data) {
    if (err) { Logging.msg(err, data); return; }
    //Logging.msg("SensorData DAL: " + data);
    callback(null, data);
  })
}

exports.findByGatewayId = (gatewayId, callback) => {
  tagSensorDataModel.find({ 'gatewayId': gatewayId.toString() }, {}, { sort: { cloudReceivedTime: -1 } }, function (err, data) {
    if (err) { Logging.msg(err, data); return; }
    //Logging.msg("SensorData DAL: " + data);
    callback(null, data);
  })
}

exports.findByShipmentId = (shipmentId, callback) => {
  tagSensorDataModel.find({ 'shipmentId': shipmentId.toString() }, {}, { sort: { cloudReceivedTime: -1 } }, function (err, data) {
    if (err) { Logging.msg(err, data); return; }
    //Logging.msg("SensorData DAL: " + data);
    callback(null, data);
  })
}

exports.insertAddTagRequest = (addTagRequestData) => {
  var addTagRequestDataModel = new addTagRequestModel(addTagRequestData);
  addTagRequestDataModel.save(function (err) {
    if (err) {
      Logging.msg("Error: " + err);
      return "Error: Saving Add Request Data into externalDB";
    }
    Logging.msg("Saved the Add Request Data into externalDB. Tag Id : " + addTagRequestDataModel.tagId);
    return null;
  });
}

exports.insertAddTagResponse = (addTagResponseData) => {
  var addTagResponseDataModel = new addTagResponseModel(addTagResponseData);
  addTagResponseDataModel.save(function (err) {
    if (err) {
      Logging.msg("Error: " + err);
      return "Error: Saving Add Response Data into externalDB";
    }
    Logging.msg("Saved the Add Response Data into externalDB. Tag Id : " + addTagResponseDataModel.tagId);
    return null;
  });
}

exports.getLastAddTagRequestRecordByTagId = async (tagId, callback) => {
  const addTagRequestQuery = addTagRequestModel.findOne(
    {
      tagId: tagId.toUpperCase(),
      messageType: Northsouth.northbound.msgids.addtagrequest
    },
    {},
    { sort: { time: -1 } });
  const addTagRequestQueryResult = await addTagRequestQuery.exec();
  return addTagRequestQueryResult;
}

exports.getLastAddTagResponseRecordByTagId = async (tagId, callback) => {
  const addTagResponseQuery = addTagResponseModel.findOne(
    {
      tagId: tagId.toUpperCase(),
      messageType: 'addTagResponse'
    },
    {},
    { sort: { time: -1 } });
  const addTagResponseQueryResult = await addTagResponseQuery.exec();
  return addTagResponseQueryResult;
}
