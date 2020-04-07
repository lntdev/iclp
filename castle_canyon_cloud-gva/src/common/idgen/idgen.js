/*
  File: idgen.js

  Description:
  Misc ID generation code for various GVA processes

  License:
  Intel TODO
*/

'use strict';

const Errorlist = require('cccommon/errorlist').errorlist;

exports.get_session_nonce = function() {
  /* HACK ALERT - remove hardcoding and make it dynamic */
  return "08090A0B0C0D0E0F";
}

exports.get_common_beacon_key = function() {
  /* HACK ALERT - remove hardcoding and make it dynamic */
  return "DEADBEEFDEADBEEFDEADBEEF01020304DEADBEEFDEADBEEFDEADBEEF01020304";
}

exports.get_gw_panid = function (prev) {

    /* HACK ALERT - working with decimal numbers < 9999 due to OBT conversion bugs */
    /* this starting point is just to aid in diags
       roll over is ok -- full 16bit value allowed*/
    var nextId = 100;

    assert_arg_is_number(prev, 'idgen.get_gw_panid');

    if(prev !== undefined && prev !== null) {
        nextId = prev + 1;
	if (nextId > 9999) nextId = 1;
    }

    return nextId;
};

exports.get_gw_wsnid = function (prev) {

    /* HACK ALERT - working with decimal numbers < 9999 due to OBT conversion bugs */
    /* this starting point is just to aid in diags
       roll over is ok -- full 16bit value allowed*/
    var nextId = 200;

    assert_arg_is_number(prev, 'idgen.get_gw_wsnid');

    if(prev !== undefined && prev !== null) {
        nextId = prev + 1;
	if (nextId > 9999) nextId = 1;
    }

    return nextId;
};

exports.get_gw_chanid = function() {

    /* HACK ALERT - hard coding 21 (integer) , so that it tranlates to 0x15 hex when going through OBT and WSN conversion mess*/
    /* this starting point is arbitrary
       this will likely be a lookup table or supplied from
       another part of the system eventually */
    var retId = 21;

    return retId;
};

exports.get_tag_wsnid = function (prev) {

    /* this starting point is just to aid in diags
       roll over is ok -- full 16bit value allowed*/
    var nextId = 300;

    assert_arg_is_number(prev, 'idgen.get_tag_wsnid');

    if(prev !== undefined && prev !== null) {
        nextId = prev + 1;
	if (nextId > 9999) nextId = 1;
    }

    return nextId;
};

/**
   make sure the arg, if defined, is a number

   @param arg - the arg to be checked
   @param fromfn - string name of function that was calling
   if arg is undefined or null that is ok..

   if arg is defined, but not a number, throw Error
*/
function assert_arg_is_number(arg, fromfn) {
    if(arg !== undefined && arg !== null) {

	if(typeof arg !== 'number') {
	    throw new Error(Errorlist.argtype_num.msg + " from: " + fromfn);
	}
    }
 }
