/*
  File: gwreceive

  Description:
  Functionality to receive messages from the gateway

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("azure-iothub-gwreceive");
Logging.enable();

/* modules that are part of this tool's codebase */
const Commonconfig = require('cccommon/config');

/* Azure related -- IoT hub and friends (also from npmjs.org) */
const {
  EventHubConsumerClient,
  latestEventPosition
} = require("@azure/event-hubs");

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
      Logging.msg("+ creating event hub client...");
      const consumerClient = new EventHubConsumerClient(options.consumerGroup, options.hubEndPoint, options.hubName);
      const subscription = consumerClient.subscribe({
        processEvents: async (events, context) => {
          for (const eventData of events) {
            Logging.msg(`Received event from partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`);
            //Logging.msg("eventData: " + JSON.stringify(eventData));
            let enqueuedTime, msgId;
            try {
              enqueuedTime = eventData.systemProperties['iothub-enqueuedtime'];
              msgId = eventData.properties.southnorth_msgid;
            } catch (err) {
              Logging.msg('Unable to decode S->N Msg!! Error: ' + err);
              Logging.msg('eventData: ' + JSON.stringify(eventData));
              return;
            }
            Logging.msg(`Msg Enqueued time: '${enqueuedTime}' Msg type: '${msgId}'`);
            var process = options.handlertable[msgId];
            if (!process) {
              process = options.handlertable['**DEFAULT**'];
            }
            var incomingMsg = {
              receivedTime: enqueuedTime,
              messageType: msgId,
              message: eventData.body
            };
            //setImmediate(process, msgId, incomingMsg);
            await process(msgId, incomingMsg);
            Logging.msg('Completed processing msg..');
            //await new Promise(resolve => setTimeout(resolve, 10000));
            //Logging.msg('awoke from sleep');
          }
        },
        processError: async (err, context) => {
          let error = 'An error occurred on the receiver: ' + err;
          Logging.msg(error);
          if (exitOnce) return;
          exitOnce = true;
          await subscription.close();
          await consumerClient.close();
          Logging.msg('Exiting...');
          reject(error);
        }
      }, {
        startPosition: {"enqueuedOn": options.msgsafter}
      });
    }

    /* implemented additional function call to initiateConnection, to handle error condition */
    function start() {
      Logging.msg("+ start()");
      options.hubEndPoint = Commonconfig.gwcomm.iothub_event_hub_compatible_endpoint();
      options.hubName = Commonconfig.gwcomm.iothub_event_hub_name();
      options.consumerGroup = '$Default';
      initiateConnection()
    }

    start();
  });
}
