/*
  File: devicesim.js

  Description:
  Main etry point for the devicesim tool.

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("devicesim");
Logging.enable();

/* modules that are part of this tool's codebase */
const Commonconfig = require('cccommon/config');
const Errorlist = require('cccommon/errorlist').errorlist;
const CCgateway = require('./ccgateway');
const Northsouth = require('cccommon/northsouth');

/* misc utility modules from npmjs.org */
const Cmdline = require('commander');
const Prompt = require('prompt');

/* Azure related -- IoT hub and friends (also from npmjs.org */
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;

const Sensordatamsg = require('./sensordatamsg');
var count = 0;
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

	if (typeof msg === "string") {
		Logging.msg(msg);
	}

	/* this puts process.exit() at end of node event loop
	   ofcourse, if anything hangs forever, we'll have to initiate
	   some other more drastic kill procedure */
	setImmediate(function () {
		process.exit(errorcode);
	});
}

/**
   This kicks off operations with the IoT hub

   the handle_xxxx functions main tain the connection
   and deal with device-to-cloud and cloud-to-device messaging

   @return returns nothing, calls shutdown on error
*/
function startHubOps() {

	/* this try block isolates azure library stuff */
	try {

		var hubclient = Client.fromConnectionString(
			Commonconfig.devicesim.iothub_device_connect_str(),
			Protocol
		);

		handle_connecting(hubclient);
	} catch (ex) {
		Logging.msg("caught exception in azure lib code", ex);
		shutdown(Errorlist.unknownazure.msg, Errorlist.unknownazure.code);
	}
}

/**
   This function attempts to connect to the iot hub ..over and over and over

   @param hubclient - an instance return from Client.fromConnectionString()
                      see startHubOps()
*/
function handle_connecting(hubclient) {

	function do_open() {
		Logging.msg("attempting to open connection to iot hub");

		hubclient.open(function (err) {
			//Logging.msg("hubclient object dump:", hubclient);

			if (err) {
				Logging.msg(Errorlist.hubconnect.msg, err);

				/* just try again in 1000ms */
				setTimeout(do_open, 1000);
				return;
			}

			/*
			   good to go - start handling inbound messages.
			   we'll generate responses and other messages based on
			   inbound messages from handle_C2Ds.
			 */
			Logging.msg("looks like we connected to the IoT hub, yay!");
			handle_disconnects(hubclient);
			handle_errors(hubclient);
			handle_C2Ds(hubclient);
			//send_test_msg_now(hubclient);
			send_sensor_data_now(hubclient);
			handle_twinUpdates(hubclient);
		});
	}

	do_open();
}

const customStringify = function (v) {
  const cache = new Set();
  return JSON.stringify(v, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        // Circular reference found
        try {
          // If this value does not reference a parent it can be deduped
         return JSON.parse(JSON.stringify(value));
        }
        catch (err) {
          // discard key if value cannot be deduped
         return;
        }
      }
      // Store value in our set
      cache.add(value);
    }
    return value;
  });
}

/**
   code that handles device twin udpates from the IoT hub

   @param hubclient - an instance return from Client.fromConnectionString()
*/
function handle_twinUpdates(hubclient) {
	hubclient.getTwin(function (err, twin) {
		if (err) {
			Logging.msg('Error: could not get twin');
			return;
		}
		Logging.msg('twin created:' )//+ customStringify(twin));
		twin.on('properties.desired', function (delta) {
			Logging.msg('new properties received:');
			Logging.msg(JSON.stringify(delta));
		});
	});
}

/**
   code that handles being disconnected from the IoT hub, does
   some housekeeping and then starts reconnect attempts

   @param hubclient - an instance return from Client.fromConnectionString()
*/
function handle_disconnects(hubclient) {

	hubclient.on('disconnect', function () {
		Logging.msgs("********************\n got disconnected from iot hub, reconnecting... \n***********************");

		hubclient.removeAllListeners();

		/* kick off connection and setup process anew */
		handle_connecting(hubclient);
	});
}

/**

   @param hubclient - an instance return from Client.fromConnectionString()
*/
function handle_errors(hubclient) {
	hubclient.on('error', function (err) {
		Logging.msg("error event from iot hub code", err);
	});
}

/**

   @param hubclient - an instance return from Client.fromConnectionString()
*/
function handle_C2Ds(hubclient) {

	/**
	   this code receives inbound messages from the cloud
	   then passed them to the ccgateway module
	   which then call send_C2D whenever it wants ..and calls done when its done
	 */
	hubclient.on('message', function (msg) {
                try {
                Logging.msg('msg received: ' + JSON.stringify(msg));
		var decodedmsg = JSON.parse(msg.getData());
		//Logging.msg("RX C2D data (decoded json)", decodedmsg);
		//Logging.msg("RX C2D properties", msg.properties);

		CCgateway.handle_C2D(msg.properties.getValue('northsouth_msgid'),
			decodedmsg,
			msg.properties,
			send_D2C,
			done);

		/*
		   NOTE: according to sample code here :
		     https://github.com/Azure/azure-iot-sdk-node/blob/master/device/samples/simple_sample_device.js

		     ...this is not required for MQTT, however, we'll keep in it, so that if we switch protocols
		     it will be here
		*/
		hubclient.complete(msg, function (err, res) {
			if (err) {
				Logging.msg("WEIRD, got error on trying to complete received C2D", err);
			}
			if (res) {
				//not much to see here ...so commented out
				//Logging.msg("C2D msg completion result", res);
			}
		});
                } catch (e) {
                  Logging.msg('Error while processing c2d msg: ' + e);
                }
	});

	/**
	   called by CCgateway module when it done processing a message
	 */
	function done(msgid, err) {
		if (err) {
			Logging.msg("weird : ccgateway reported errors handing: " + msgid);
		} else {
			Logging.msg("success : ccgateway handled a: " + msgid);
		}
	}

	/**
       provided to the CCgateway module so that it can TX responses back to the
       the cloud without having to think of IoT hub particulars

       @param msg { object } - with this template:
         {
             data: < object to be serialized >
	     properties: {
	         <key 1> : <string val 1>,
                 <key 2> : <string val 2>
	     }
	 }

     */
	function send_D2C(msg) {

		//Logging.msg("msg dump (before send):", msg);

		var hubreadymsg = new Message(JSON.stringify(msg.data));
		for (var key in msg.properties) {
			hubreadymsg.properties.add(key, msg.properties[key]);
		}

		/* set it up to the hub */
		hubclient.sendEvent(hubreadymsg, function (err, res) {
			if (err) {
				Logging.msg("error sending D2C msg", err);
			} else {
				Logging.msg("success sending D2C msg");
			}

			if (res) {
				//turning off to reduce noise
				//Logging.msg("D2C send result", res);
			}
		});
	}

}

function send_test_msg_now(hubclient) {

	function send_D2C(msg) {

		//Logging.msg("msg dump (before send):", msg);

		var hubreadymsg = new Message(JSON.stringify(msg.data));
		for (var key in msg.properties) {
			hubreadymsg.properties.add(key, msg.properties[key]);
		}

		/* set it up to the hub */
		hubclient.sendEvent(hubreadymsg, function (err, res) {
			if (err) {
				Logging.msg("error sending D2C msg", err);
			} else {
				Logging.msg("success sending D2C msg");
			}

			if (res) {
				//turning off to reduce noise
				//Logging.msg("D2C send result", res);
			}
			process.exit(1);
		});
	}

	/* this message is tailered to specific test scenarios */
	send_D2C({
		data: {
			test: 'this is a test message from a device that does not follow the rulez',
		},
		properties: {
			//southnorth_msgid : Northsouth.northbound.msgids.sensordata,
			egg: "unknown device that doesnt follow msgs rulez",
		},

	});
}

function send_sensor_data_now(hubclient) {

	function send_D2C(msg) {

		//Logging.msg("msg dump (before send):", msg);
                msg.data.count = count++;
                Logging.msg(`Sending tag sensor data count: '${msg.data.count}'`);
		var hubreadymsg = new Message(JSON.stringify(msg.data));
		for (var key in msg.properties) {
			hubreadymsg.properties.add(key, msg.properties[key]);
		}

		/* set it up to the hub */
		hubclient.sendEvent(hubreadymsg, function (err, res) {
			if (err) {
				Logging.msg("error sending D2C msg", err);
			} else {
				Logging.msg("success sending D2C msg");
			}

			if (res) {
				//turning off to reduce noise
				//Logging.msg("D2C send result", res);
			}
		});
	}

	function generate_data() {
		/* generating a sensor data message */
		var respmsg = Sensordatamsg.get();
		setInterval(send_D2C, 100, respmsg);
	}

	generate_data();
}

/**
   using 'main' for readability

   @return nothing - code will call shutdown() which will exit the tool with and error codes
*/
function main() {

	Logging.msg("+main()");

	//Logging.msg("available configuration items in Commonconfig:", Commonconfig);
	// Logging.msg("error list: ", Errorlist);

	startHubOps();

}

main();
