/*
  File: devprovtool.js

  Description:
  Main etry point for the gwmessenger process / code

  License:
  Intel TODO
*/

'use strict';

/* modules that are part of this tool's codebase */
const Config  = require('devprovtool-config');

/* misc utility modules from npmjs.org */
const Cmdline    = require('commander');
const inspect    = require('eyes').inspector({maxLength: 4096});
const Async      = require('async');
const Uuidlib    = require('uuid');
const Superagent = require('superagent');

/* Azure stuff */
const Iothub  = require('azure-iothub');

/* logging - note since this is an interactive CLI tool, we're not logging
   out to central logging facility (ex Azure App Insights) like other
   modules in the GVA */
const Logging = {
    msg : function(msg, obj) {
	const localTime = new Date().toLocaleString();
	var prefixstring = "devprovtool";
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

function setup_hub_devices(options, configtable, connectstr, donecb) {

    Logging.msg("working on: " + options.msgprefix);
    //Logging.msg("configtable dump: ", configtable);

    var deviceregistry = Iothub.Registry.fromConnectionString(connectstr);

    var addlist    = [];
    var updatelist = [];

    /* this loop works through the configuration table, and
       build items in the 'regitems' array */
    for (var entry in configtable) {
	//Logging.msg("table entry dump: ", configtable[entry]);

	if (!configtable[entry].uuid     ||
	    !configtable[entry].easyref) {
	    donecb("missing one or more of fields from table entry: deviceid, uuid, easyref");
	    return;
	}
	Logging.msg("working on uuid: " + configtable[entry].uuid);
	var item = {
	    deviceId : configtable[entry].uuid,
	    properties : {
		reported : {
		    ccdetails : {
			uuid     : configtable[entry].uuid,
			easyref  : configtable[entry].easyref,
		    },
		 },
	    },
	    authentication : {
		symmetricKey : {
		    primaryKey : new Buffer(Uuidlib.v4()).toString('base64'),
		    secondaryKey : new Buffer(Uuidlib.v4()).toString('base64'),
		}
	    },
	};
	if (configtable[entry].op == 'add'){
	    addlist.push(item);
	}
	else if(configtable[entry].op == 'update'){
	    updatelist.push(item);
	}
    }


    Async.series([
	function(doneadd) {
	    Logging.msg("device to be added: ",    addlist);
	    /* okay, no errors, we should have a full 'regitems' array to submit to the registry */
	    var msg = "device add: success";
	    if(addlist.length > 0) {
		deviceregistry.addDevices(addlist, function(err, res, transportresp) {
    		    if(err) {
    			msg = "device add: error, " + err.message;
    		    }
		    doneadd(null, msg);
		});
	    }
	    else {
		doneadd(null, "device add: nothing to do");
	    }
	},
	function(doneupdate) {
	    Logging.msg("device to be updated : ", updatelist);
	    var msg = "device update: success";
	    if(updatelist.length > 0) {
		deviceregistry.updateDevices(updatelist, true, function(err, res, transportresp) {
    		    if(err) {
    			msg = "device update: error, " + err.message;
    		    }
		    doneupdate(null, msg);
		});
	    }
	    else {
		doneupdate(null, "device update: nothing to do");
	    }
	}
    ], function(err,results) {
	Logging.msg("done working on: " + options.msgprefix);
	donecb(null, results);
    });
}

/**
   using 'main' for readability

   @return nothing - code will call shutdown() which will exit the tool with and error codes
*/
function main() {

    Logging.msg("+main()");

    //pull from local config file
    var gateway_table = Config.gateway_device_table();
    var tag_table     = Config.tag_device_table();

    //pull from csv via URL/cloud
    //var csv_data      = null;
    /*
     */
    //var gateway_table = null;
    //var tag_table     = null;

    /* run setup in order, short circuiting on any errors */
    Async.series([
	function(donecb){
	    if(Config.gateway_device_setup == false){
		donecb(null, "skipped gateways setup, config.gateway_device_setup == false");
		return;
	    }

	    setup_hub_devices({msgprefix: "gateways" },
			      gateway_table,
			      Config.gateway_iot_hub_conn_str(), donecb);
	},
	function(donecb){
	    if(Config.tag_device_setup == false) {
		donecb(null, "skipped tags setup, config.tag_device_setup == false");
		return;
	    }

	    setup_hub_devices({msgprefix: "tags" },
			      tag_table,
			      Config.tag_iot_hub_conn_str(), donecb);
	}
    ], function(err, res) {
	if(err) {
	    var errmsg = "errors occured";
	    Logging.msg(errmsg, err);
	}

	Logging.msg("setup results", res);
	shutdown("finished",0);
    });
}

main();
