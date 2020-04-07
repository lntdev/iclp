/*
  File: addtagrequest.js

  Description:
  handles the add tag request from GW

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("gwlistener/addtagrequest");
Logging.enable();

const gwmClient = require('cccommon/client/gwmessenger');
const Northsouth = require('cccommon/northsouth');
const StoreToDb = require('../util/storetodb');
const dal = require('cccommon/dal');
const shipDal = dal.shipment;
const sensorDataDal = require('cccommon/dal/sensordata');
const GwComms = require('cccommon/gwcomms');
const addTagRequestModel = require('cccommon/models/externaldb/addtagrequest').addTagRequest;

module.exports = async function (msgid, msg) {
  Logging.msg("RX msg: " + msgid);
  Logging.msg("RX msg dump:", msg.message);

  // storing GW data to external DB
  await insertAddTagRequestData(msg);

  var gatewayId = msg.message.gatewayId;
  var tagListResponse = [];
  var tagAssociatedShipments = [];
  var tagsToShipmentDict = {};
  for (let tag of msg.message.tagList) {
    const tagShipments = await shipDal.findByTagUUID(tag);
    //Logging.msg('tagShipments: ' + JSON.stringify(tagShipments));
    if (tagShipments.length) {
      let tagHandle = {};
      let shipmentId = tagShipments[0].get('id');
      tagHandle.shipmentId = shipmentId;
      tagHandle.packageId = tagShipments[0].tagPackageId;
      tagHandle.referenceId = tag;
      tagListResponse.push({
        tagId: tag,
        tagHandle: JSON.stringify(tagHandle),
        beaconKey: null,
        encryptionCode: null,
      });

      // Add to Tag Associated Shipment List
      if (!tagAssociatedShipments.includes(shipmentId)) {
        tagAssociatedShipments.push(shipmentId);
      }

      // Add Tag to Shipment Dict
      tagsToShipmentDict[tag] = shipmentId;
    }
  }

  var req = {
    body: {
      tagList: tagListResponse
    },
    id: ''
  }

  Logging.msg('gatewayId: ' + gatewayId);
  Logging.msg('gwmessenger request: ' + JSON.stringify(req));

  if (tagListResponse.length) {
    // Respond to Add Tag Request
    await gwmClient.addTagResponse(req, gatewayId);

    // Loop over each tagsToShipmentDict and process further
    for (let item in tagsToShipmentDict) {
      Logging.msg("Tag UUID : " + item + ", Shipment ID : " + tagsToShipmentDict[item] + "");

      /* Get Shipment Data by Shipment SQL Primary Key*/
      const shipment = await shipDal.findByPrimaryKey(tagsToShipmentDict[item]);
      //Logging.msg("Shipment Data : " + JSON.stringify(shipment));

      const tagsInShipment = [];
      shipment.shippingUnits.forEach(shippingUnit => {
        shippingUnit.tags.forEach(tag => {
          tagsInShipment.push(tag.uuid);
          //Logging.msg("Tag Data: " + JSON.stringify(tag));
          // Validate for Tag UUID property
          if (tagsToShipmentDict.hasOwnProperty(tag.uuid)) {
            // Send Config Chnage Request
            sendConfigChangeRequest(gatewayId, [tag.uuid], tag, tagsToShipmentDict[item]);
          }
        });
      });
      Logging.msg("tagsInShipment: " + JSON.stringify(tagsInShipment));
    }
  } else {
    Logging.msg("No active shipments for these tags, not sending response");
  }

  return;
}

/* Insert AddTagRequest data*/
async function insertAddTagRequestData(addTagRequestInputData) {
  Logging.msg('insertAddTagRequestData: ' + JSON.stringify(addTagRequestInputData));
  // Loop over each tag and insert record to DB
  for (let tagId of addTagRequestInputData.message.tagList) {

    // Build Add Tag Response Message
    let addTagRequestObj = new addTagRequestModel
    addTagRequestObj.cloudReceivedTime = addTagRequestInputData.receivedTime;
    addTagRequestObj.gatewayTime = addTagRequestInputData.message.time;
    addTagRequestObj.gatewayId = addTagRequestInputData.message.gatewayId.toUpperCase();
    addTagRequestObj.tagId = tagId.toUpperCase();

    // Insert record to DB collection
    sensorDataDal.insertAddTagRequest(addTagRequestObj);
  };
}

/* Send Config Change Request to device data*/
async function sendConfigChangeRequest(gatewayId, tagList, tagThresholds, shipmentId) {

  var sendoptions = {
    callername: "gwmessenger/eventrx",
  };


  var timeNow = Date.now();
  var changeConfigMsg = {
    "msgType": Northsouth.southbound.msgids.configchange,
    "JSON": {
      "time": timeNow,
      "gatewayId": gatewayId,
      "shipmentId": shipmentId,
      "messageToken": "someToken",
      "configList": [{
        "applyToAll": false,
        "tagList": tagList,
        "configParams": [{
            "type": "light",
            "enableSensor": tagThresholds.lightIsEnabled,
            "thrIsValid": true,
            "thresholds": {
              "min": tagThresholds.lightMin,
              "max": tagThresholds.lightMax
            }
          },
          {
            "type": "humidity",
            "enableSensor": tagThresholds.humidityIsEnabl,
            "thrIsValid": true,
            "thresholds": {
              "min": tagThresholds.humidityMin,
              "max": tagThresholds.humidityMax
            }
          },
          {
            "type": "temperature",
            "enableSensor": tagThresholds.temperatureIsEnabled,
            "thrIsValid": true,
            "thresholds": {
              "min": tagThresholds.temperatureMin,
              "max": tagThresholds.temperatureMax
            }
          },
          {
            "type": "pressure",
            "enableSensor": tagThresholds.pressureIsEnabled,
            "thrIsValid": true,
            "thresholds": {
              "min": tagThresholds.pressureMin,
              "max": tagThresholds.pressureMax
            }
          },
          {
            "type": "battery",
            "enableSensor": tagThresholds.batteryIsEnabled,
            "thrIsValid": true,
            "thresholds": {
              "min": tagThresholds.batteryMin,
              "max": null
            }
          },
          {
            "type": "shock",
            "enableSensor": tagThresholds.shockIsEnabled,
            "thrIsValid": true,
            "thresholds": {
              "min": null,
              "max": tagThresholds.shockMax
            }
          },
          {
            "type": "tilt",
            "enableSensor": tagThresholds.tiltIsEnabled,
            "thrIsValid": true,
            "thresholds": {
              "min": null,
              "max": tagThresholds.tiltMax
            }
          }
        ]
      }]
    }
  };

  Logging.msg("configuration change data dump: ", JSON.stringify(changeConfigMsg));
  Logging.msg("sending: " + Northsouth.southbound.msgids.configchange +
    " to " + gatewayId);
  await GwComms.sendGwMsg(
      sendoptions,
      gatewayId, {
        properties: {
          northsouth_msgid: Northsouth.southbound.msgids.configchange,
          msgType: Northsouth.southbound.msgids.configchange
        },
        data: changeConfigMsg
      })
    .then(function (reason) {
      Logging.msg("ConfigChanged");
    })
    .catch(function (reason) {
      Logging.msg("Catch ConfigChange: " + reason);
    })
}


function localTest() {
  var msg = {
    receivedTime: Date.now(),
    messageType: Northsouth.northbound.msgids.addtagrequest,
    message: {
      gatewayId: 'simulateddevice001',
      tagList: [
        'simulateddevice026',
        'simulateddevice027'
      ]
    }
  };

  module.exports(Northsouth.northbound.msgids.addtagrequest, msg);
}
//localTest()
