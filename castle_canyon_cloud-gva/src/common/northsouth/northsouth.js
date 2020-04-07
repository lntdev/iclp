/*
  File: northsouth.js

  Description:
  Common elements that are to be shared between the GVA and GW
  AKA - things that are shared between NORTH and SOUTH logic, processes and what have yous

  License:
  Intel TODO

*/

'use strict';

exports.southbound = {
    msgids: {
        test: "com.intel.wsn.gwMessengerTest",
        configchange: "com.intel.wsn.multipleConfigChangeReq",
        disassociation: "com.intel.wsn.disassociationReq",
        microIntervalChange: "com.intel.wsn.microIntervalChange",
        macroIntervalChange: "com.intel.wsn.macroIntervalChange",
        rebootGateway: "com.intel.wsn.rebootGateway",
        calibrateGateway: "com.intel.wsn.calibrationReq",
        channelChangeGateway: "com.intel.wsn.channelIdChange",
        airplaneMode: "com.intel.wsn.airplaneModeChangeReq",
        uploadDiagnosticConfig: "com.intel.c4.uploadDiagnosticConfig",
        startReceving: "com.intel.co.disassociateReq",
        addtagresponse: "com.intel.wsn.addTagResponse",
        removetag: "com.intel.wsn.removeClientsRequest",
        provisionresponse: "com.intel.wsn.provisionResponse"
    },
};

exports.northbound = {
    msgids: {
        test: "com.intel.wsn.gwMessengerTestResp",
        configchange: "com.intel.wsn.multipleConfigChangeResp",
        association: "com.intel.wsn.associationComplete",
        disassociation: "com.intel.wsn.disassociationResp",
        associationcomplete: "com.intel.wsn.associationComplete",
        sensordata: "com.intel.wsn.sensorData",
        addtagrequest: "com.intel.wsn.addTagRequest",
        provisionrequest: "com.intel.wsn.provisionRequest",
    },
};
