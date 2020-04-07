/*
  File: errorlist.js

  Description:
  A list of all error strings and values used by this tool

  License:
  Intel TODO

*/

'use strict';

exports.errorlist = {
    noerror             : { msg : "no errors",                                               code : 0   },
    hubconnect          : { msg : "failed to connect to the IoT hub",                        code : 100 },
    unknownazure        : { msg : "an exception was thrown from the azure libs",             code : 101 },
    noeventid           : { msg : "need a valid event identifer in request path /event/:id", code : 102 },
    validate_shipmentid : { msg : "shipment id input failed validation",                     code : 103 },
    dbconnect           : { msg : "failed to connect to internal GVA master database",       code : 104 },
    argtype_num         : { msg : "argtype should have been a number",                       code : 105 },
    validate_requestid  : { msg : "internal request id input failed validation",             code : 106 },
    validate_gatewayid  : { msg : "gateway id input failed validation",                      code : 107 },

    unknownreqerror     : { msg : "unknown request or server error BAD",                     code : 500 },
    notfounderror       : { msg : "not found",                                               code : 404 },

    //
};
