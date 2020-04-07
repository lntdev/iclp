/*
  File: gwmessenger.js

  Description:
  Main etry point for the gwmessenger process / code

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging    = require('cccommon/logging').logger("gwmessenger");
Logging.enable();

/* modules that are part of this tool's codebase */
const Commonconfig = require('cccommon/config');
const Eventrx      = require('./eventrx');

/* misc utility modules from npmjs.org */
const Cmdline    = require('commander');


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

    if(typeof msg === "string"){
	Logging.msg(msg);
    }

    /* this puts process.exit() at end of node event loop
       ofcourse, if anything hangs forever, we'll have to initiate
       some other more drastic kill procedure */
    setImmediate(function(){
	process.exit(errorcode);
    });
}

/**
   using 'main' for readability

   @return nothing - code will call shutdown() which will exit the tool with and error codes
*/
function main(){

    Logging.msg("+main()");

    // Logging.msg("available configuration items in Commonconfig:", Commonconfig);
    // Logging.msg("error list: ", Errorlist);

    /* gwmessenger is driven by events received on the internal
       http interface */
    Eventrx.run(function(err){
	shutdown(err.msg, err.code);
    });
}

main();
