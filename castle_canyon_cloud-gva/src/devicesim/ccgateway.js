/*
  File: ccgateway.js

  Description:
  Module that implements the "simulated" castle canyon gateway
  behaviours in terms of D2C messages generation and C2D message
  handling.

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging    = require('cccommon/logging').logger("ccgateway");
Logging.enable();

/* modules that are part of this tool's codebase */
const Errorlist  = require('cccommon/errorlist').errorlist;
const Northsouth = require('cccommon/northsouth');

/* misc utility modules */
const Async      = require('async');

/**
   handles an inbound C2D message, including generating any required responses

   @param msgid {string} - a message id from the cccommon/northsouth module

   @param msg {object}   - the message

   @param properties {object} - additional properties (for routing, handling etc) that came with the message
     see: https://docs.microsoft.com/en-us/javascript/api/azure-iot-common/properties?view=azure-iot-typescript-latest

   @param txcallback {function}
     - function with signature f(msg) - used for sending responses to the GVA in cloud
         msg { object } - with this template:
         {
             data: < object to be serialized >
	     properties: {
	         <key 1> : <string val 1>,
                 <key 2> : <string val 2>
	     }
	 }

   @param donecallback {function}
     - calback function with signature f(err, cookie)
       err - can be null, else errorlist object from cccommon/errorlist

   Notes:
   for testing, this code will look for a
*/
exports.handle_C2D = function(msgid,
			      msg,
			      properties,
			      txcallback,
			      donecallback) {

    Logging.msg("RXd msgid: " + msgid);
    //Logging.msg("msg dump: ", msg);
    //Logging.msg("props dump: ", properties);

    var handlertable = {};

    handlertable[Northsouth.southbound.msgids.test] = function() {
	Logging.msg("sending D2C: " + Northsouth.northbound.msgids.test);

	Async.series([
	    // function(donecb) {
	    // 	/* generate an test response message first which is a handy
	    // 	   marker for test logic in cloud  */
	    // 	var respmsg = {
	    // 	    data : {
	    // 		echo: msg.JSON.echo
	    // 	    },
	    // 	    properties : {
	    // 		southnorth_msgid : Northsouth.northbound.msgids.test,
	    // 		egg              : "This is a simulation",
	    // 	    },
	    // 	};
	    // 	txcallback(respmsg);
	    // 	donecb(null, 'test');
	    // },
	    // function(donecb) {
	    // 	/* generating an association complete message */
	    // 	var respmsg = {
	    // 	    data : {
	    // 		time : Date.now(),
	    // 		gatewayWsnId  : "8AAA",
	    // 		ShipmentId    : msg.JSON.ShipmentId,
	    // 		location      : {
	    // 		    latitude            : 45.540065,
	    // 		    longitude           : -122.610528,
	    // 		    altitude            : "16",
	    // 		    positionUncertainty : "5",
	    // 		    locationMethod      : "GPS",
	    // 		    timeOfPosition      : Date.now() - (60000*10), //10 minutes ago
	    // 		},
	    // 		State: "Success"
	    // 	    },
	    // 	    properties : {
	    // 		southnorth_msgid : Northsouth.northbound.msgids.associationcomplete,
	    // 		egg              : "Association complete",
	    // 	    },
	    // 	};
	    // 	txcallback(respmsg);
	    // 	donecb(null, 'association complete');
	    // },
	    function(donecb) {
		/* generating a sensor data message */
		var respmsg = {
		    data : {
			time : Date.now(),
			gatewayId     : "gw-1",
			ShipmentId    : msg.JSON.ShipmentId,
			messageToken  : "testtoken",
			location      : {
			    latitude            : 45.540065,
			    longitude           : -122.610528,
			    altitude            : "16",
			    positionUncertainty : "5",
			    locationMethod      : "GPS",
			    timeOfPosition      : Date.now() - (60000*10), //10 minutes ago
			},
			IsEncrypted: "No",
			Payload : [
			    {
				//first tag
				TagId : 2001,
				Sensordata : [
				    {
					"type": "light",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "1",
					"anomalyValue": "0",
				    },
				    {
					"type": "humidity",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "2",
					"anomalyValue": "0",
				    },
				    {
					"type": "temperature",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "3",
					"anomalyValue": "0",
				    },
				    {
					"type": "pressure",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "4",
					"anomalyValue": "0",
				    },
				    {
					"type": "battery",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "5",
					"anomalyValue": "0",
				    },
				    {
					"type": "shock",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "6",
					"anomalyMinValue": "8",
					"anomalyMaxValue": "20",
					"anomalyCount": "0",
				    },
				    {
					"type": "tilt",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "7",
					"anomalyValue": "0",
				    },
				]
			    },
			    {
				//second tag
				TagId : 2002,
				Sensordata : [
				    {
					"type": "light",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "1",
					"anomalyValue": "0",
				    },
				    {
					"type": "humidity",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "2",
					"anomalyValue": "0",
				    },
				    {
					"type": "temperature",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "3",
					"anomalyValue": "0",
				    },
				    {
					"type": "pressure",
					"isAnalysis":"false",
					"isAnomaly":"true",
					"currentValue": "289",
					"anomalyValue": "260",
				    },
				    {
					"type": "battery",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "5",
					"anomalyValue": "0",
				    },
				    {
					"type": "shock",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "6",
					"anomalyMinValue": "8",
					"anomalyMaxValue": "20",
					"anomalyCount": "0",
				    },
				    {
					"type": "tilt",
					"isAnalysis":"true",
					"isAnomaly":"false",
					"currentValue": "7",
					"anomalyValue": "0",
				    },
				]
			    },
			]
		    },
		    properties : {
			southnorth_msgid : Northsouth.northbound.msgids.sensordata,
			egg              : "SensorData Message!",
		    },
		};
		txcallback(respmsg);
		donecb(null, 'association complete');
	    }

	], function(err, results) {

	    // final callback called at end, or shortcircuit if err
	    // we only care about errors, not the results array
	    Logging.msg("done generating south-north messages");
	});

    };

    handlertable[Northsouth.southbound.msgids.configchange] = function() {

	Logging.msg("sending D2C: " + Northsouth.northbound.msgids.configchange);
	//because this is test code -- we just reflect back
	//these fields we received
	var respmsg = {
	    data : {
		time          : Date.now(),
		gwDeviceRegID : msg.JSON.gwDeviceRegID,
		gatewayWsnId  : msg.JSON.gatewayWsnId,
		ShipmentId    : msg.JSON.ShipmentId,
		Tag           : msg.JSON.Tag,
		location      : {
		    latitude            : 45.540065,
		    longitude           : -122.610528,
		    altitude            : "16",
		    positionUncertainty : "5",
		    locationMethod      : "GPS",
		    timeOfPosition      : Date.now() - (60000*10), //10 minutes ago
		}
	    },
	    properties : {
		southnorth_msgid : Northsouth.northbound.msgids.configchange,
		egg              : "Config Change!",
	    },
	};
	txcallback(respmsg);
    };

    handlertable[Northsouth.southbound.msgids.disassociation] = function() {

	Logging.msg("sending D2C: " + Northsouth.northbound.msgids.disassociation);
	//because this is test code -- we just reflect back
	//these fields we received
	var respmsg = {
	    data : {
		gwDeviceRegID : msg.JSON.gwDeviceRegID,
		time          : Date.now(),
		gatewayWsnId  : msg.JSON.gatewayWsnId,
		ShipmentId    : msg.JSON.ShipmentId,
		Tag           : msg.JSON.Tag,
		location      : {
		    latitude            : 45.540065,
		    longitude           : -122.610528,
		    altitude            : "16",
		    positionUncertainty : "5",
		    locationMethod      : "GPS",
		    timeOfPosition      : Date.now() - (60000*10), //10 minutes ago
		}
	    },
	    properties : {
		southnorth_msgid : Northsouth.northbound.msgids.disassociation,
		egg              : "Disassociation",
	    },
	};
	txcallback(respmsg);
    };

    if (!handlertable[msgid]) {
	Logging.msg("No handler for: " + msgid);
	return;
    }

    // call the handler
    handlertable[msgid]();

    //MOVE THIS TO THE RIGHT CALLBACK
    donecallback(msgid);
}
