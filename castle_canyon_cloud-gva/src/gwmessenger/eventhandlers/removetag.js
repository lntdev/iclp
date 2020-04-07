/*
  File: removetag.js

  Description:
  event handler to send remove tag to concerned GW

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("eventhandler/removetag");
Logging.enable();

const GwComms = require('cccommon/gwcomms');
const Northsouth = require('cccommon/northsouth');

const sendoptions = {
  callername: "gwmessenger/eventrx",
};

module.exports = async function (eventdetails) {
  Logging.msg('Remove Tag Hangler: ' + Northsouth.southbound.msgids.disassociation);
  Logging.msg('eventdetails: ' + JSON.stringify(eventdetails));
  const gatewayId = eventdetails.gatewayId;
  Logging.msg("gateway ID: " + gatewayId);

  var response = {};
  var msg = {
    properties: {
      northsouth_msgid: Northsouth.southbound.msgids.disassociation,
    },
    data: {
      msgType: Northsouth.southbound.msgids.disassociation,
      JSON: {
        time: Date.now(),
        gatewayId: gatewayId,
        messageToken: '',
        applyToAll: false,
        tagList: eventdetails.requestBody.tagList
      }
    }
  };

  await GwComms.sendGwMsg(sendoptions, gatewayId, msg)
    .then(function (reason) {
      Logging.msg("Result Pass: " + reason);
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