/*
  File: gwsendmsg.js 

  Description:
  Functionality to send messages to the gateway

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging   = require('cccommon/logging').logger("azure-iothub-gwsendmsg");
Logging.enable();

/* modules that are part of this tool's codebase */
const Commonconfig   = require('cccommon/config');
const Errorlist      = require('cccommon/errorlist').errorlist;
const Northsouth     = require('cccommon/northsouth');

/* misc utility modules from npmjs.org */
const async          = require('async');

/* Azure related -- IoT hub and friends (also from npmjs.org) */
const IotHubClient   = require('azure-iothub').Client;
const Message        = require('azure-iot-common').Message;

/**
   Sends a device a Cloud to Device message to the physical gateway device

   @param opttions : see options template below

   @param deviceid :  the device id value - which is the devices unique identifer in the
               the device registry. This can be found in the Azure Dashbaord's IoT Hub
               resource, under "Device Explorer".

   @param  msg  : object with the payload for the north-to-south message,


   The options object requires the following values:
   {
     callername : "name of calling module"
   }

   The 'msg' object should follow this template:
   {
     data        : "raw data as a string",
     properties  : {
       "some-key-name1" : "value 1",
       "some-key-name2" : "value 2",
       ...
     }
   }

   @return promise
*/
module.exports = (options, deviceid, msg) => {
  return new Promise(function(resolve, reject) {
    /* this try block isolates azure library stuff */
    try {
	var hubclient = IotHubClient.fromConnectionString(Commonconfig.gwcomm.iothub_service_policy_connect_str());
	Logging.msg("openiot hub as a service for " + options.callername);
	hubclient.open(function (err) {
	    //Logging.msg("hubclient object dump:", hubclient);
	    if(err) {
		Logging.msg(Errorlist.hubconnect.msg, err);
                reject(err);
	    }

	    /* good to go!! */
	    Logging.msg("connected to the IoT hub, yay!");
	    /* send the device the msg - data as JSON string!!*/
	    var hubreadymsg = new Message(JSON.stringify(msg.data));
	    for ( var key in msg.properties) {
		hubreadymsg.properties.add(key, msg.properties[key]);
	    }
	    Logging.msg("TX msg dump:", msg);
	    //Logging.msg("hubreadymsg dump:", hubreadymsg);
	    hubclient.send(deviceid, hubreadymsg,function(err,res){
	    	//Logging.msg("+ hubclient.send() callback");
	    	if(err){
                    Logging.msg("error sending north-to-south msg", JSON.stringify(err));
                    reject(err);
	    	}
		else {
	    	    Logging.msg("success sending north-to-south msg");
		}

	    	if(res) {
		    //not a lot in here, so commented out
	    	    //Logging.msg("C2D send result", res);
	    	}

		hubclient.close(function(err){
		    if(err){
			Logging.msg("Error closing hubclient...");
                        reject(err);
		    }
		    else {
			Logging.msg("closed hubclient for " + options.callername);
                        resolve();
		    }
		});
	    });
	});
    }
    catch (ex) {
	Logging.msg("caught exception in azure lib code", ex);
        reject(ex);
    }
  });
};

