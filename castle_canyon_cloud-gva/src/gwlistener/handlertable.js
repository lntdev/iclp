/*
  File: handlertable.js

  Description:
  implements the handler jump table

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("gwlistener/handlertable");
Logging.enable();

/* modules that are part of this tool's codebase */
const Northsouth = require('cccommon/northsouth');

/**
   Define the handler table for all messages

   @return nothing 
*/
var handlertable = {};
handlertable[Northsouth.northbound.msgids.addtagrequest]    = require('./handlers/addtagrequest');
handlertable[Northsouth.northbound.msgids.provisionrequest] = require('./handlers/provisionrequest');
handlertable[Northsouth.northbound.msgids.sensordata]       = require('./handlers/sensordata');
handlertable['**DEFAULT**']                                 = require('./handlers/defaulthandler');

exports.handlertable = handlertable;