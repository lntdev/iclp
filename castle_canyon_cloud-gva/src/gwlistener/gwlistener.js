/*
  File: gwlistener.js

  Description:
  Main etry point for the gwlistener process / code

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("gwlistener");
Logging.enable();

/* modules that are part of this tool's codebase */
const GwComms = require('cccommon/gwcomms');
const sensorDataDal = require('cccommon/dal/sensordata');

/**
   the main run loop

   @return nothing 
*/
async function loop(options) {
  Logging.msg("+loop()");
  sensorDataDal.getLastRecord(function (err, data) {
    if (err || data == null) {
      Logging.msg('could not get last sensor data record: ' + err);
      Logging.msg('proceeding with current time');
      options.msgsafter = Date.now();
    } else {
      //Logging.msg('data: ' + data);
      Logging.msg('Last receivedTime: ' + data.receivedTime);
      options.msgsafter = data.receivedTime;
    }

    GwComms.receiveGwMsgs(options).catch((err) => {
      Logging.msg('Error in listener: ' + err);
      setImmediate(loop, options);
    });
  });
}

/**
   using 'main' for readability

   @return nothing - code will call shutdown() which will exit the tool with and error codes
*/
async function main() {

  Logging.msg("+main()");

  function onerror(err) {
    Logging.msg("error from gwcomms: ", err);
    shutdown(err.msg, err.code);
  }

  var options = {
    handlertable: require('./handlertable').handlertable,
    errorcb: onerror
  };

  setImmediate(loop, options);
}

main();

/**
   Wrapper for orderly shutdown

   @param msg - an optional message to be emitted on shutdown

   @return calls
*/
function shutdown(msg, errorcode) {
  Logging.msg("shutting down...");

  if (typeof errorcode !== 'number') {
    Logging.msg("Non numeric error code passed into shutdown() ..using 255 instead");
    errorcode = 255
  }

  if (typeof msg === "string") {
    Logging.msg(msg);
  }

  /* this puts process.exit() at end of node event loop
     ofcourse, if anything hangs forever, we'll have to initiate
     some other more drastic kill procedure */
  setImmediate(function () {
    process.exit(errorcode);
  });
}
