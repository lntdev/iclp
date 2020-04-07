/*
  File: defaulthandler.js

  Description:
  handles all unhandled messages from the GW

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("gwlistener/defaulthandler");
Logging.enable();

module.exports = async function (msgid, msg) {
  Logging.msg("RX msg: " + msgid);
  Logging.msg("RX msg dump:", msg.message);
//  Logging.msg('going to sleep..');
//  await new Promise(resolve => setTimeout(resolve, 5000));
//  Logging.msg('..out of sleep');
}
