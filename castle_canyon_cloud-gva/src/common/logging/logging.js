/*
  File: logging.js

  Description:
  A very thing abstraction for logging -- in one place.

  License:
  Intel TODO

*/

'use strict';

/* modules that are part of this tool's codebase */
const Commonconfig  = require('cccommon/config');

const inspect    = require('eyes').inspector({maxLength: 4096});
const azappin    = require('applicationinsights');

azappin.setup(Commonconfig.logging.appinsights_instrumentation_key())
.setAutoDependencyCorrelation(false)
.setAutoCollectRequests(false)
.setAutoCollectPerformance(false)
.setAutoCollectExceptions(false)
.setAutoCollectDependencies(false)
.setAutoCollectConsole(false)
.setUseDiskRetryCaching(false); // Likely source of delay, causes ./bin/test_app_insights to hang.

// Try to reduce the time it takes for events to show up on the search UI.
// Causes ./bin/test_app_insights to noticibly faster.
azappin.defaultClient.config.maxBatchSize = 1;
azappin.defaultClient.config.maxBatchIntervalMs = 1;

azappin.defaultClient.commonProperties = {
  envinfo: Commonconfig.logging.env_info(),
  buildinfo: Commonconfig.logging.build_info()
};

azappin.start();

exports.logger = function(prefixstring) {

    /* creating a closure to that returned loggers are specific
       to the modules that bring them in */
    var retlogger = (function() {
	var appinclient = azappin.defaultClient;
	var on     = false;

	function send_to_app_insights(msg,obj) {
	    let props = {};

	    if (obj) {
		if (typeof obj === 'string') {
		    props.stringDetail = obj;
		}
		else if(typeof obj === 'number') {
		    props.numberDetail = obj.toString();
		}
		else if(typeof obj === 'object') {
		    props = Object.assign({}, obj, props);
		}
		else {
		    props = Object.assign({}, {unkLoggingMsgObjType: (typeof obj)}, props);
		}
	    }

		const localTime = new Date().toLocaleString();
		var prefix = `${localTime} [${prefixstring}]: `;
	    props.logPrefix = prefixstring;

	    send_to_console(msg,prefix, props);

	    // App Insights search UI does not support showing properties with depth greater than 1.
	    Object.keys(props).forEach(k => {
		if (props[k] instanceof Object) {
		    try {
			var jsonVal = JSON.stringify(props[k], null, 2);
			props[k] = jsonVal;
		    }
		    catch(err){
			props[k] = "likely circular object cant jsonify";
		    }
		}
	    });

	    //appinclient.trackEvent({name: msg, properties: props});
	    appinclient.trackTrace({
		message: msg,
		severity: azappin.Contracts.SeverityLevel.Information,
		properties: props
	    });

	    //put on end of node event queue
	    setImmediate(() => {
		appinclient.flush();
	    });
	}

	function send_to_console(msg, prefix, obj) {
	    //console.log("vvvv Logging.msg.send_to_console() vvvv");
	    console.log(prefix + ( typeof msg === 'string' ? msg : "<nomsg>"));

	    if((typeof obj === 'string') ||
 	       (obj instanceof Object) ) {
		inspect(obj);
	    }
	    //console.log("^^^^ Logging.msg.send_to_console() ^^^^");
	}

	return {
    // Allow modules like tests to flush before exiting.
    flushWithCallback: (cb) => {
      appinclient.flush({callback: cb});
    },

	    /**
	       turn log output on
	    */
	    enable : function(){
		on = true;
	    },

	    /**
	       turn log output off
	    */
	    disable: function(){
		on = false;
	    },

	    /**
	       logging message wrapper

	       This can send formatted messages to standard out using the eyes
	       module.

	       It can (and will) also be hooked up to a central logging system
	       in a cloud deployment.

	       NOTE: don't call shutdown() in here as it calls logmsg() itself

	       @param msg - string to be output
	       @param obj - optional object to be output with pretty formatting

	       @return nothing
	    */
	    msg : function(msg, obj) {
		if(on == false) return;

		//send_to_console(msg,obj);
		send_to_app_insights(msg,obj);
	    },
	}

    })();
    return retlogger;
}

