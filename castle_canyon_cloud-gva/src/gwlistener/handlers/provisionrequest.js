/*
  File: provisionrequest.js

  Description:
  handles the Provision data request from GW

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("gwlistener/provisionrequest");
Logging.enable();

const gwmClient = require('cccommon/client/gwmessenger');
const Northsouth = require('cccommon/northsouth');
const StoreToDb = require('../util/storetodb');
const dal = require('cccommon/dal');
const shipDal = dal.shipment;
const sensorDataDal = require('cccommon/dal/sensordata');
const GwComms = require('cccommon/gwcomms');
//const addTagRequestModel = require('cccommon/models/externaldb/addtagrequest').addTagRequest;
const keystoreDal = require('cccommon/dal/keystore');

module.exports = async function (msgid, msg) {
  Logging.msg("RX msg: " + msgid);
  Logging.msg("RX msg dump:", msg.message);

  var gatewayId = msg.message.gatewayId;
  Logging.msg('Provision request gatewayId : ' + gatewayId);

  // Get Key store data by Gateway UUID
  keystoreDal.findByUuid(gatewayId, function (error, data) {
    // Look for any errors
    if (error) {
      Logging.msg('Error in calling mongoDb api : ' + error);
      return;
    }

    // Process the Key store data
    if (data) {
      Logging.msg('Key store data : ' + JSON.stringify(data));
      try {
        var provisionData = JSON.parse(data.provisionData) || {};
      } catch (e) {
        Logging.msg('Error : Unable to find provision data, for the given gateway UUID in Key store Database:' + e);
        return;
      }

      // Build the response strcture
      let provisionResponse = {
        gatewayUuid: gatewayId,
        provisionData: provisionData.provisionData,
        multiConfigChange: provisionData.multiConfigChange
      }

      Logging.msg('Gateway provision data : ' + JSON.stringify(provisionResponse));

      // Send provision response
      sendProvisionResponse(gatewayId, provisionResponse);
      return;
    } else {
      Logging.msg('Error : Gateway uuid was not found in database.');
      return;
    }
  });
  return;
}


/* Send provision data response to device data*/
async function sendProvisionResponse(gatewayId, provisionResponse) {
  Logging.msg('provisionResponse!!');

  var sendoptions = {
    callername: "gwmessenger/eventrx",
  };

  Logging.msg("sending: " + Northsouth.southbound.msgids.provisionresponse +
    " to " + gatewayId);
  await GwComms.sendGwMsg(
    sendoptions,
    gatewayId, {
    properties: {
      northsouth_msgid: Northsouth.southbound.msgids.provisionresponse,
      msgType: Northsouth.southbound.msgids.provisionresponse
    },
    data: provisionResponse
  })
    .then(function (reason) {
      Logging.msg("provisionresponse");
    })
    .catch(function (reason) {
      Logging.msg("Catch provisionresponse: " + reason);
    })
}

function localTest() {
  var msg = {
    receivedTime: Date.now(),
    messageType: Northsouth.northbound.msgids.provisionrequest,
    message: {
      gatewayId: 'simulateddevice001',
      time: Date.now(),
      messageToken: Date.now()
    }
  };

  module.exports(Northsouth.northbound.msgids.provisionrequest, msg);
}
//localTest()