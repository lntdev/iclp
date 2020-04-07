/*
  File: gwreceive

  Description:
  Functionality to receive messages from the gateway

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("azure-iotcentral-gwreceive");
Logging.enable();

/* modules that are part of this tool's codebase */
const Commonconfig = require('cccommon/config');
const Errorlist = require('cccommon/errorlist').errorlist;
const Northsouth = require('cccommon/northsouth');

/* misc utility modules from npmjs.org */
const async = require('async');

/* Azure related -- IoT hub and friends (also from npmjs.org) */
const {
  EventHubClient,
  EventPosition,
  delay
} = require('@azure/event-hubs');

/**
   receive loop for device to cloud messages coming from the gateway IoT Hub
   (casted as an EventHub due to it having EventHub compatible interfaces

   options object requires this template (all values!):
    {
        handlertable: handlertable,
        callername  : "your module name string",
        errorcb     : f(err)
    }

    handlertable is a list of keynames mapped to functions.
      - each keyname should be a value from sourceroot/common/northsouth/northsouth.js
    {
       "Northsouth.xxx.msdids.yyyy" = function(msgid,msg),
    }
*/
module.exports = function (options) {
  return new Promise(async function (resolve, reject) {
    async function initiateConnection() {
      var partitionIds;
      var receiveHandler = [];
      var exitOnce = false;
      Logging.msg("+ initiateConnection()");
      const onMessage = (eventData) => {
        Logging.msg("eventData: " + JSON.stringify(eventData));
        let enqueuedTime;
        let msgId;
        try {
          enqueuedTime = eventData.annotations["x-opt-enqueued-time"];
          msgId = eventData.applicationProperties.southnorth_msgid;
        } catch (err) {
          Logging.msg("Unable to decode S->N Msg!!");
          return;
        }
        Logging.msg("Enqueued Time: " + enqueuedTime + ", msg: " + msgId);
        var process = options.handlertable[msgId];
        if (!process) {
          process = options.handlertable['**DEFAULT**'];
        }
        var incomingSensorData = {
          receivedTime: enqueuedTime,
          messageType: msgId,
          message: eventData.body
        };
        setImmediate(process, msgId, incomingSensorData);
      };
      const onError = async (err) => {
        let error = 'An error occurred on the receiver: ' + err;
        Logging.msg(error);
        if (exitOnce) return;
        exitOnce = true;
        Logging.msg('attempting to stop all receive handlers');
        for (var i = 0; i < partitionIds.length; i++) {
          await receiveHandler[i].stop();
        }
        Logging.msg('stopped all receive handlers');
        await client.close().catch(err => Logging.msg('error while closeing connection: ' + err));
        reject(error);
      };

      Logging.msg("+ creating event hub client...");
      const client = await EventHubClient.createFromConnectionString(options.hubendpoint, options.hubname);
      partitionIds = await client.getPartitionIds();
      Logging.msg('event hub partitions: ', partitionIds, partitionIds.length);
      for (var i = 0; i < partitionIds.length; i++) {
        receiveHandler[i] = await client.receive(partitionIds[i],
          onMessage,
          onError, {
            eventPosition: EventPosition.fromEnqueuedTime(options.msgsafter)
          });
      }
      Logging.msg('msg receiver handlers initilised.. ');

      //testing
      //Logging.msg('Exiting...');
      //onError('testing..');
    }

    /* implemented additional function call to initiateConnection, to handle error condition */
    function start() {
      Logging.msg("+ start()");
      options.hubendpoint = Commonconfig.gwcomm.iotc_event_hub_compatible_endpoint();
      options.hubname = Commonconfig.gwcomm.iotc_event_hub_name();
      initiateConnection()
    }

    start();
  });
}
