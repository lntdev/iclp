/*
  File: sensordata.js

  Description:
  takes care of sensor data received from GW

  License:
  Intel TODO

*/
'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("gwlistener.sensordata");
Logging.enable();

/* gva common modules */
const shipDal = require('cccommon/dal/shipment');
const tagSensorDataModel = require('cccommon/models/externaldb/tagsensordata').tagSensorData;

/* gw listener modules */
const StoreToDb = require('../util/storetodb');
const GeoLocation = require('../util/geolocation');
const Geofence = require('../util/geofence');

module.exports = async function (msgid, msg) {
  Logging.msg("RX msg: " + msgid + " for Shipment: " + msg.message.shipmentId);
  //Logging.msg("msg: " + JSON.stringify(msg));
  //Check for GPS location, if not, try and update with GLA
  var newPayload = await checkAndUpdateLocation(msg);

  //Logging.msg("newPayload: " + JSON.stringify(newPayload));

  // Process individual Sensor (Tag) device data and Upload Tag data to the MongoDB.
  await processSensorDataTag(newPayload.message, newPayload.receivedTime);

  // if (newPayload.message.location.locationMethod != "NoPosition") {
  //   // Update the Shipment Record with the last know location
  //   updateShipmentLocation(newPayload);

  //   // Process any GeoFence Rules
  //   processGeofence(newPayload);
  // } else {
  //   Logging.msg("No Location information to update shipment record or process geofence");
  // }
  Logging.msg('Finished processing SensorData message from Gateway');
}

async function checkAndUpdateLocation(payload) {
  var msgPayload = payload.message;

  // incase position has been provided by GW, dont override in GVA
  if (msgPayload.location.locationMethod != "NoPosition") {
    return (payload);
  }

  // first establish if there is sufficient info to perform GeoLocation
  var getGeoLocation = false;
  var networkLocationStructure = {};
  // Validate cellTowers
  if (msgPayload.location.hasOwnProperty('cellTowers')) {
    // Validate for empty cellTowers
    if (msgPayload.location.cellTowers && msgPayload.location.cellTowers.length > 0) {
      // Valid Cell Towers Array
      let validCellTowersArray = [];
      // Loop over each cellTowers info data
      for (let cellTower of msgPayload.location.cellTowers) {
        // Validate if all properties exists
        if (cellTower.hasOwnProperty('locationAreaCode') && cellTower.hasOwnProperty('mobileCountryCode') && cellTower.hasOwnProperty('mobileNetworkCode')) {
          // Validate for valid Cell Tower values
          if ((cellTower.locationAreaCode == 0) || (cellTower.locationAreaCode >= 65534) || (cellTower.mobileCountryCode == 65535) || (cellTower.mobileNetworkCode == 65535)) {
            Logging.msg("Error: Has invalid Cell Towers Info, Ignore further processing : " + JSON.stringify(cellTower));
          } else {
            getGeoLocation = true;
            // Push valid cellTower info to array
            validCellTowersArray.push(cellTower);
          }
        }
      }
      // Assign Valid CellTowers Array to cellTowersArray
      networkLocationStructure.cellTowersArray = validCellTowersArray;
    }
  }
  // Validate wifiAccessPoints
  if (msgPayload.location.hasOwnProperty('wifiAccessPoints')) {
    // Validate for empty wifiAccessPoints
    if (msgPayload.location.wifiAccessPoints && msgPayload.location.wifiAccessPoints > 0) {
      getGeoLocation = true;
      networkLocationStructure.wifiAccessPointsArray = msgPayload.location.wifiAccessPoints;
    }
  }

  if (getGeoLocation) {
    // sufficient info available, proceed with geolocation.
    return await GeoLocation(networkLocationStructure)
      .then(async function (resolve) {
        glaLocation = resolve;
        Logging.msg("Replacing Location information in SensorData payload: " + JSON.stringify(glaLocation.locationData));
        msgPayload.location.latitude = glaLocation.locationData.location.lat;
        msgPayload.location.longitude = glaLocation.locationData.location.lng;
        msgPayload.location.positionUncertainty = glaLocation.locationData.accuracy;
        if (msgPayload.location.timeOfPosition === '0') {
          msgPayload.location.timeOfPosition = Date.now();
        }
        // GLA-From-GVA indicates geolocation was performed in GVA..
        msgPayload.location.locationMethod = "GLA-From-GVA";
        msgPayload.location.altitude = -1;
        // updated original payload
        payload.message = msgPayload;
        return payload;
      })
      .catch(async function (reject) {
        Logging.msg("Error while performing GeoLocation: " + reject);
        // if GeoLocation was not performed for any reason, return original payload..
        return payload;
      })
  } else
    return payload;
}

async function updateShipmentLocation(payload) {
  return new Promise(function (resolve, reject) {
    var shipmentid = payload.shipmentId;
    if (isNaN(shipmentid)) {
      //Logging.msg("using shipDal.findByShipmentId for shipment lookup: " + shipmentid);
      var queryFn = shipDal.findByShipmentId;
    } else {
      //Logging.msg("using shipDal.findByPrimaryKey for shipment lookup: " + shipmentid);
      var queryFn = shipDal.findByPrimaryKey;
    }
    queryFn(shipmentid)
      .then(function (shipment) {
        if (shipment) {
          //Logging.msg("about to update location in shipping record...");
          shipment.update({
            telemetryReportingTime: Number(payload.location.timeOfPosition),
            telemetryLatitude: Number(payload.location.latitude),
            telemetryLongitude: Number(payload.location.longitude),
          }).then(function (ok) {
            //Logging.msg("shipment location updated successfully!");
            resolve();
          }, function (err) {
            Logging.msg("while updating shipment location error occurred: " + err);
            resolve();
          });
        } else {
          Logging.msg("shipment record not valid in database..can't update location!");
          resolve();
        }
      })
  });
}

async function processGeofence(payload) {
  await Geofence.checkAndNotifyGeofenceAlert(payload);
}

async function processSensorDataTag(inputSensorData, cloudReceivedTime) {
  //Logging.msg("In processSensorDataTag....");
  try {
    // Validate for Empty Sensor Data
    if (!Object.keys(inputSensorData).length) {
      Logging.msg("Input Sensor Data is Empty.");
      return;
    }

    // Validate for payload presence
    if (!inputSensorData.hasOwnProperty('payload')) {
      Logging.msg("SensorData has no payload.");
      return;
    }

    // Build Tag Sensor Data Properties
    let cloudReceivedTime = Date.now();
    let gatewayReceivedTime = Number(inputSensorData.time);
    let gatewayId = String(inputSensorData.gatewayId);
    let location;

    // Validate for location property
    if (inputSensorData.hasOwnProperty('location')) {
      location = inputSensorData.location;

      // Validate for cellTowers property
      if (location.hasOwnProperty('cellTowers')) {
        // Delete Cell Tower property
        delete location.cellTowers;
      }

      // Validate for cellTowers property
      if (location.hasOwnProperty('wifiAccessPoints')) {
        // Delete wifiAccessPoints property
        delete location.wifiAccessPoints;
      }

      // Format Location data type's
      location.latitude = Number(location.latitude);
      location.longitude = Number(location.longitude);
      location.altitude = Number(location.altitude);
      location.positionUncertainty = Number(location.positionUncertainty);
      location.locationMethod = String(location.locationMethod);
      location.timeOfPosition = Number(location.timeOfPosition);
    } else {
      Logging.msg("No Location data found.");
    }

    // Loop over each Device and parse sensor data
    for (let deviceInfo of inputSensorData.payload) {
      //Logging.msg(JSON.stringify(deviceInfo))

      // Create New Tag Sensor Data Object
      var tagSensorDataObj = new tagSensorDataModel();

      // start populating
      tagSensorDataObj.cloudReceivedTime = Number(cloudReceivedTime);
      tagSensorDataObj.gatewayReceivedTime = gatewayReceivedTime;
      tagSensorDataObj.tagCapturedTime = Number(deviceInfo.time);
      tagSensorDataObj.tagId = String(deviceInfo.tagId);
      tagSensorDataObj.gatewayId = gatewayId;

      // Set Location data
      tagSensorDataObj.location.latitude = location.latitude;
      tagSensorDataObj.location.longitude = location.longitude;
      tagSensorDataObj.location.altitude = location.altitude;
      tagSensorDataObj.location.positionUncertainty = location.positionUncertainty;
      tagSensorDataObj.location.locationMethod = location.locationMethod;
      tagSensorDataObj.location.timeOfPosition = location.timeOfPosition;

      // Process Tag Handle data
      if (deviceInfo.tagHandle !== null && deviceInfo.tagHandle !== '' && deviceInfo.tagHandle !== undefined) {
        // Parse Tag Handle Data
        let tagHandle = JSON.parse(deviceInfo.tagHandle);
        tagSensorDataObj.shipmentId = String(tagHandle.shipmentId);
        tagSensorDataObj.packageId = String(tagHandle.packageId);
        tagSensorDataObj.referenceId = String(tagHandle.referenceId);
      }

      // Validate for sensorData presence
      if (!deviceInfo.hasOwnProperty('sensorData')) {
        Logging.msg("Has No sensorData ...");
        continue;
      }

      // Loop over each Sensor Type and parse sensor data
      for (let sensorInfo of deviceInfo.sensorData) {

        // Validate for isAnalysis property
        if (sensorInfo.hasOwnProperty('isAnalysis')) {
          // Delete isAnalysis property
          delete sensorInfo.isAnalysis;
        }

        // Validate for anomalyValue property
        if (sensorInfo.hasOwnProperty('anomalyValue')) {
          // Delete anomalyValue property
          delete sensorInfo.anomalyValue;
        }

        // Validate for anomalyCount property
        if (sensorInfo.hasOwnProperty('anomalyCount')) {
          // Delete anomalyCount property
          delete sensorInfo.anomalyCount;
        }

        // Validate for anomalyMaxValue property
        if (sensorInfo.hasOwnProperty('anomalyMaxValue')) {
          // Delete anomalyMaxValue property
          delete sensorInfo.anomalyMaxValue;
        }

        // Validate for anomalyMinValue property
        if (sensorInfo.hasOwnProperty('anomalyMinValue')) {
          // Delete anomalyMinValue property
          delete sensorInfo.anomalyMinValue;
        }

        // Get Current and Anomaly values
        let sensorCurrentValue;
        let sensorisAnomaly;

        // Validate for currentValue property
        if (sensorInfo.hasOwnProperty('currentValue')) {
          // Get Current value
          sensorCurrentValue = sensorInfo.currentValue;
        }

        // Validate for isAnomaly property
        if (sensorInfo.hasOwnProperty('isAnomaly')) {
          // Get Anomaly value
          sensorisAnomaly = sensorInfo.isAnomaly;
        }


        // Validate Sensor Current value for null or empty
        if (sensorCurrentValue === null || sensorCurrentValue === '' || sensorCurrentValue === undefined) {
          sensorCurrentValue = '';
        } else {
          sensorCurrentValue = Number(sensorCurrentValue);
        }

        // Validate Sensor Current isAnomaly value for null or empty
        if (sensorisAnomaly === null || sensorisAnomaly === '' || sensorisAnomaly === undefined) {
          sensorisAnomaly = false;
        } else {
          sensorisAnomaly = JSON.parse(sensorisAnomaly);
        }

        // Parse Sensor Values
        switch (sensorInfo.type) {
          case "battery":
            tagSensorDataObj.batteryValue = sensorCurrentValue;
            tagSensorDataObj.batteryAnomaly = sensorisAnomaly;
            break;
          case "temperature":
            tagSensorDataObj.temperatureValue = sensorCurrentValue;
            tagSensorDataObj.temperatureAnomaly = sensorisAnomaly;
            break;
          case "humidity":
            tagSensorDataObj.humidityValue = sensorCurrentValue;
            tagSensorDataObj.humidityAnomaly = sensorisAnomaly;
            break;
          case "shock":
            tagSensorDataObj.shockValue = sensorCurrentValue;
            tagSensorDataObj.shockAnomaly = sensorisAnomaly;
            break;
          case "tilt":
            tagSensorDataObj.tiltValue = sensorCurrentValue;
            tagSensorDataObj.tiltAnomaly = sensorisAnomaly;
            break;
          case "light":
            tagSensorDataObj.lightValue = sensorCurrentValue;
            tagSensorDataObj.lightAnomaly = sensorisAnomaly;
            break;
          case "pressure":
            tagSensorDataObj.pressureValue = sensorCurrentValue;
            tagSensorDataObj.pressureAnomaly = sensorisAnomaly;
            break;
          default:
            Logging.msg("Invalid Sensor Type.")
        }
      }

      //Logging.msg("Tag Sensor Data : " + JSON.stringify(tagSensorDataObj));

      // Store Tag sensor data to the MongoDB
      //setImmediate(StoreToDb, tagSensorDataObj, null);
      await StoreToDb(tagSensorDataObj, null);

      // Validate Shipment ID value for null or empty
      if (tagSensorDataObj.shipmentId === null ||
        tagSensorDataObj.shipmentId === '' ||
        tagSensorDataObj.shipmentId === undefined ||
        tagSensorDataObj.shipmentId === '0') {
        Logging.msg("In-Valid Shipment ID. Ignore updating shipment last know location info. Tag ID : " + tagSensorDataObj.tagId);
      } else {
        // Update the Shipment Record with the last know location
        if (tagSensorDataObj.location.locationMethod != "NoPosition") {
          // Update the Shipment Record with the last know location
          await updateShipmentLocation(tagSensorDataObj);

          // If device is gateway only and part of shipment tigger GeoFence action
          if (tagSensorDataObj.gatewayId === tagSensorDataObj.tagId) {
            Logging.msg("Process any GeoFence Rules for Gateway ID : " + tagSensorDataObj.gatewayId);
            // Process any GeoFence Rules
            await processGeofence(tagSensorDataObj);
          }
        } else {
          Logging.msg("No Location information to update shipment record or process geofence. Tag ID : " + tagSensorDataObj.tagId);
        }
      }
    }
  } catch (ex) {
    Logging.msg("Error in processing Tag Sensor Data : ", ex);
  }
}
