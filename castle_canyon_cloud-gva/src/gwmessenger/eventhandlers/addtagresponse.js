/*
  File: addtagresponse.js

  Description:
  event handler to send add tag response to concerned GW

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("eventhandler/addtagresponse");
Logging.enable();

const GwComms = require('cccommon/gwcomms');
const Northsouth = require('cccommon/northsouth');
const sensorDataDal = require('cccommon/dal/sensordata');
const addTagResponseModel = require('cccommon/models/externaldb/addtagresponse').addTagResponse;

const sendoptions = {
  callername: "gwmessenger/eventrx",
};

module.exports = async function (eventdetails) {
  Logging.msg('Add Tag Response: ' + Northsouth.southbound.msgids.addtagresponse);
  Logging.msg('eventdetails: ' + JSON.stringify(eventdetails));
  const gatewayId = eventdetails.gatewayId;
  Logging.msg("gateway ID: " + gatewayId);

  var response = {};
  var msg = {
    properties: {
      northsouth_msgid: Northsouth.southbound.msgids.addtagresponse,
    },
    data: {
      msgType: Northsouth.southbound.msgids.addtagresponse,
      JSON: {
        time: Date.now(),
        gatewayId: gatewayId,
        messageToken: '',
        tagList: eventdetails.requestBody.tagList
      }
    }
  };

  await GwComms.sendGwMsg(sendoptions, gatewayId, msg)
    .then(function (reason) {
      Logging.msg("Result Pass: " + reason);

      /* Insert AddTagResponse data*/
      insertAddTagResponseData(msg.data.JSON);

      response = {
        status: "Pass",
        details: reason
      };
    })
    .catch(function (reason) {
      Logging.msg("Result Error: " + reason);
      response = {
        status: "Fail",
        details: reason
      };
    })
  return response;
}

/* Insert AddTagResponse data*/
async function insertAddTagResponseData(addTagResponseInputData) {

  // Loop over each tag and insert record to DB
  for (let tag of addTagResponseInputData.tagList) {
    let addTagResponseObj = new addTagResponseModel;
    addTagResponseObj.time = addTagResponseInputData.time;
    addTagResponseObj.gatewayId = addTagResponseInputData.gatewayId.toUpperCase();
    addTagResponseObj.tagId = tag.tagId.toUpperCase();
    addTagResponseObj.handle = tag.tagHandle;

    // Insert record to DB collection
    sensorDataDal.insertAddTagResponse(addTagResponseObj);
  };
}
