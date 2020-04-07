'use strict';

// Tag Sensor Data Schema
module.exports.tagSensorDataSchema = {
  cloudReceivedTime: Number,
  gatewayReceivedTime: Number,
  tagCapturedTime: Number,
  messageType: String,
  tagId: String,
  packageId: String,
  shipmentId: String,
  referenceId: String,
  gatewayId: String,
  lost: Boolean,
  batteryValue: Number,
  batteryAnomaly: Boolean,
  temperatureValue: Number,
  temperatureAnomaly: Boolean,
  humidityValue: Number,
  humidityAnomaly: Boolean,
  shockValue: Number,
  shockAnomaly: Boolean,
  tiltValue: Number,
  tiltAnomaly: Boolean,
  lightValue: Number,
  lightAnomaly: Boolean,
  pressureValue: Number,
  pressureAnomaly: Boolean,
  location: {
    latitude: Number,
    longitude: Number,
    altitude: Number,
    positionUncertainty: Number,
    locationMethod: String,
    timeOfPosition: Number
  }
}

// Tag Sensor Data Class
module.exports.tagSensorData = function tagSensorData() {
  this.cloudReceivedTime = Date.now();
  this.gatewayReceivedTime;
  this.tagCapturedTime;
  this.messageType = "sensorData";
  this.tagId;
  this.packageId = '';
  this.shipmentId = '';
  this.referenceId = '';
  this.gatewayId;
  this.lost = false;
  this.batteryValue;
  this.temperatureValue;
  this.humidityValue;
  this.shockValue;
  this.tiltValue;
  this.lightValue;
  this.pressureValue = '';
  this.batteryAnomaly = false;
  this.temperatureAnomaly = false;
  this.humidityAnomaly = false;
  this.shockAnomaly = false;
  this.tiltAnomaly = false;
  this.lightAnomaly = false;
  this.pressureAnomaly = false;
  this.location = {
    latitude: null,
    longitude: null,
    altitude: null,
    positionUncertainty: null,
    locationMethod: null,
    timeOfPosition: null
  };
}
