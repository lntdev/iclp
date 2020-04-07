/*
  File: deviceexperiments.js

  Description:
  this a dumping ground for some code that I used to experiment
  with working with the iot hub device twins to prove out theory
  of operation before pulling the code into gwtagproxy and friends.

  code written with guidance from the iothub explorer sample by microsoft.
  Specifically with guidance from this:
      https://github.com/Azure/iothub-explorer/blob/master/iothub-explorer-list.js

  License:
  Intel TODO
*/

'use strict';

/* modules that are part of this tool's codebase */
const Config  = require('devprovtool-config');

/* misc utility modules from npmjs.org */
const Cmdline = require('commander');
const inspect = require('eyes').inspector({maxLength: 4096});
const Async   = require('async');
const Uuidlib = require('uuid');

/* Azure stuff */
const IothubService  = require('azure-iothub');

const DeviceProtocol  = require('azure-iot-device-mqtt').Mqtt;
const DeviceClient    = require('azure-iot-device').Client;
const DeviceMessage   = require('azure-iot-device').Message;

/* logging - note since this is an interactive CLI tool, we're not logging
   out to central logging facility (ex Azure App Insights) like other
   modules in the GVA */
const Logging = {
    msg : function(msg, obj) {
	const localTime = new Date().toLocaleString();
	var prefixstring = "listdevices";
	var prefix = `${localTime} [${prefixstring}]: `;

	console.log(prefix + ( typeof msg === 'string' ? msg : "<nomsg>"));

	if((typeof obj === 'string') ||
 	   (obj instanceof Object) ) {
	    inspect(obj);
	}
    }
};

/**
   Wrapper for orderly shutdown

   @param msg - an optional message to be emitted on shutdown

   @return calls
*/
function shutdown(msg, errorcode) {


    Logging.msg("shutting down...");

    if (typeof errorcode !== 'number') {
	Logging.msg("WEIRD: non numeric error code passed into shutdown() ..using 255 instead");
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

function list_devices(options, connectstr, donecb){

    var deviceregistry = IothubService.Registry.fromConnectionString(connectstr);

    deviceregistry.list(function(err, devices) {
	if(err) {
	    Logging.msg("error listing " + options + " devices, err dump: ", err);
	    donecb("error listing devices");
	    return;
	}

	for (var currdev in devices) {
	    Logging.msg(options.prefix + " device dump:", devices[currdev]);
	}

	donecb(null, options.msgprefix + " success");
    });
}

function single_device(options, connectstr, donecb) {

    var deviceregistry = IothubService.Registry.fromConnectionString(connectstr);

    deviceregistry.get(options.deviceid, function(err, deviceobj){
	if(err) {
	    Logging.msg(options.msgprefix + " errors getting device, err dump: ", err);
	    donecb("error getting device");
	    return;
	}

	Logging.msg("success getting device, deviceobj dump: ", deviceobj);
	donecb(null, "success");
    });
}

function update_twin(options, connectstr, donecb) {

    Async.waterfall([
	function(donecb) {
	    var deviceregistry = IothubService.Registry.fromConnectionString(connectstr);
	    //Logging.msg("deviceregistry dump: ", deviceregistry);

	    deviceregistry.get(options.deviceid, function(err, deviceobj) {
		if(err) {
		    Logging.msg(options.msgprefix + " errors getting device, err dump: ", err);
		    donecb("error getting device");
		    return;
		}

		//Logging.msg("success getting device, deviceobj dump: ", deviceobj);
		donecb(null,
		       deviceregistry._config.host,
		       deviceobj.deviceId,
		       deviceobj.authentication.symmetricKey.primaryKey);
	    });
	},
	function(iothubhost, tagdeviceid, tagkey, donecb) {
	    /*
	      build a connect string to connect AS device, then update reported properties
	      HostName=cc-gw-iothub.azure-devices.net;DeviceId=gw-1;SharedAccessKey=KEY-FROM-REGISTRY
	    */
	    var tagconnstr = "HostName=" + iothubhost + ";DeviceId=" + tagdeviceid + ";SharedAccessKey=" + tagkey;
	    //Logging.msg("tagconnstr: ", tagconnstr);
	    donecb(null, tagconnstr);
	},
	function(tagconnstr, donecb) {
	    /* now, ready to work with the iothub  as a tag device ..using the azure-iothub-device package! */

	    var taghubclient = DeviceClient.fromConnectionString(tagconnstr,DeviceProtocol);

	    taghubclient.getTwin(function(err, tagtwin) {
    		if(err) {
    		    Logging.msg(options.msgprefix + " errors getting device twin, err dump: ", err);
    		    donecb("error getting device");
    		    return;
    		}

		// dumptwin(tagtwin);

    		//now test updating the reported properties
    		tagtwin.properties.reported.update({
    		    foo : null,
    		    ccdetails : {
    			foo : null,
    			easyref : "yukka yukka"
    		    }
    		}, function(err, res) {
    		    if(err) {
    			Logging.msg("error updating twin, err dump: ", err);
    			donecb("error updating twin");
    		    }
    		    Logging.msg("updated twin!");
    		    donecb(null, "success");
    		});
	    });
	}
    ], function(err, res) {
	donecb(err, res);
    });

}

function dumptwin(twin) {
    Logging.msg("dumping twin, at top level keys: ");
    for (var key in twin) {
	Logging.msg("twin." + key + " dump: ", twin[key]);
    }
}

/**
   using 'main' for readability

   @return nothing - code will call shutdown() which will exit the tool with and error codes
*/
function main() {


    function donecb(err, res){
	if(err){
	    Logging.msg("err dump: ", err);

	    shutdown("failed",1);
	    return;
	}
	shutdown("success",0);
    }

    // list_devices({msgprefix: "gateways" },
    // 		 Config.gateway_iot_hub_conn_str(), donecb);

    // list_devices({msgprefix: "tags" },
    // 		 Config.tag_iot_hub_conn_str(), donecb);

    // single_device(
    // 	{
    // 	    msgprefix: "tag-device",
    // 	    deviceid: "tag-1"
    // 	},
    //  	Config.tag_iot_hub_conn_str(),
    // 	donecb
    // );

    update_twin (
    	{
    	    msgprefix: "tag-device",
    	    deviceid: "tag-1"
    	},
     	Config.tag_iot_hub_conn_str(),
    	donecb
    );

}

main();
