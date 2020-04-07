/*
  File: inputvalidation.js

  Description:
  A module that helps with a variety of input validation ..in order
  to help with security best practices

  License:
  Intel TODO

*/

'use strict';

const Errorlist     = require('cccommon/errorlist').errorlist;

exports.event = {

    /**
      @param obj to check for valid shipping id key
    */
    shipmentid : function(eventdetails) {
	if (eventdetails['shipmentId'] === undefined ||
	    typeof eventdetails['shipmentId'] !== 'string') {
	    var err = new Error(Errorlist.validate_shipmentid.msg);
	    err['errorlist_entry'] = Errorlist.validate_shipmentid;
	    throw err;
	}
    },

    /**
      @param obj to check for valid shipping id key
    */
    requestid : function(eventdetails) {
	if (eventdetails['requestId'] === undefined ||
	    typeof eventdetails['requestId'] !== 'string') {
	    var err = new Error(Errorlist.validate_requestid.msg);
	    err['errorlist_entry'] = Errorlist.validate_requestid;
	    throw err;
	}
    },

    /**
      @param obj to check for valid shipping id key
    */
    gatewayid : function(eventdetails) {
        if (eventdetails['gatewayId'] === undefined ||
            typeof eventdetails['requestId'] !== 'string') {
            var err = new Error(Errorlist.validate_gatewayid.msg);
            err['errorlist_entry'] = Errorlist.validate_gatewayid;
            throw err;
        }
    },
}
