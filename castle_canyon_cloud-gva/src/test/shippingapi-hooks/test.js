/*
  File: hooks/test.js

  Description:
  Module for shipping API hook functions.

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging   = require('cccommon/logging').logger("shippingapi-hooks-test");
Logging.enable();

const Superagent = require('superagent');
const Async = require('async');

/* modules that are part of this tool's codebase */
const Commonconfig  = require('cccommon/config');
const format        = require('cccommon/format');

const randvalstr = Math.random().toString();

/*
  note that we DO NOT have any ID values in this data structure
  ...those only come into play when the shipment enters monitoring
*/
var BASENAME = "KN-demo"
const shipment_new = {
    status                : 'new',
    shipmentId            : BASENAME,
    uShipmentId           : BASENAME + ' uShipmentId',
    shipmentName          : BASENAME + ' shipmentName',
    shippingUnitCount     : 2,
    referenceId           : BASENAME + ' referenceId',
    shipmentNote          : BASENAME + ' shipmentNote',
    customerName          : BASENAME + ' customerName',
    customerEmail         : 'testcustomer@test.customer.email',

    customerAddress: {
	line1   : BASENAME + ' customer address line 1',
	city    : BASENAME + ' customer city',
	state   : BASENAME + ' customer state',
	pin     : BASENAME + ' customer pin',
	country : BASENAME + ' customer country',
	phone   : BASENAME + ' customer phone',
    },

    earliestPickup        : format.datetime.toMysql(new Date()),
    latestDelivery        : format.datetime.toMysql(new Date()),
    tag2GwReportingTime   : 123,
    gw2CloudReportingTime : 456,

    pickupAddress: {
	line1   : BASENAME + ' pickup address line 1',
	city    : BASENAME + ' pickup city',
	state   : BASENAME + ' pickup state',
	pin     : BASENAME + ' pickup pin',
	country : BASENAME + ' pickup country',
	phone   : BASENAME + ' pickup phone',
    },

    deliveryAddress: {
	line1   : BASENAME + ' delivery address line 1',
	city    : BASENAME + ' delivery city',
	state   : BASENAME + ' delivery state',
	pin     : BASENAME + ' delivery pin',
	country : BASENAME + ' delivery country',
	phone   : BASENAME + ' delivery phone',
    },

    gateways: [
        {
            shippingUnits: [
		{
		    tags: [
			{
			    thresholds: {
				temperature: {
				    min: 10,
				    max: 20,
				},
				humidity: {
				    min: 10,
				    max: 20,
				},
				light: {
				    min: 10,
				    max: 20,
				},
				pressure: {
				    min: 10,
				    max: 20,
				},
				tilt: {
				    max: 20,
				},
				shock: {
				    max: 20,
				},
				battery: {
				    min: 1
				}
			    }
			}
		    ]
		},
		{
		    tags: [
			{
			    thresholds: {
				temperature: {
				    min: 0,
				    max: 30,
				},
				humidity: {
				    min: 20,
				    max: 30,
				},
				light: {
				    min: 20,
				    max: 30,
				},
				pressure: {
				    min: 20,
				    max: 30,
				},
				tilt: {
				    max: 30,
				},
				shock: {
				    max: 30,
				},
				battery: {
				    min: 2
				}
			    }
			}
		    ]
		}
            ]
	}
    ]
}; //shipment_new

/*
   note that the number of gateways, shippingUnits and Tags matches
   the shipping_new object above
*/
const monitor = {
    gateways: [
	{
	    id: "integration-test",
	    shippingUnits: [
		{
		    id: "su-1",
		    tags: [
			{
			    id: "AI01",
			    wsnId: 201,
			}
		    ],
		},
		{
		    id: "su-2",
		    tags: [
			{
			    id: "AI02",
			    wsnId: 202,
			}
		    ],
		},

	    ]
	}
    ]

};

/*
   PCS2 rest api seems to only support thresholds / alarms
   applied to the whole device group , which is currently mapped
   to a shipment.
   Therefore, even through there are two shippingUnits and tags in here
   The hook code to update PCS2 will only use the first set of thresholds.
   We need to go back to the drawing board on the mapping
   of a device group to shipment, and have a device group mapped to a shipping unit
*/
const monitor_config = {
    tag2GwReportingTime   : (60*15),
    gw2CloudReportingTime : (60*15),
    gateways: [
	{
	    id: "integration-test",
	    shippingUnits: [
		{
		    id: "su-1",
		    tags: [
			{
			    id: "AI01",
			    thresholds: {
				temperature: {
				    min:10,
				    max:20,
				},
				humidity: {
				    min: 10,
				    max: 20,
				},
				light: {
				    min: 10,
				    max: 20,
				},
				pressure: {
				    min: 10,
				    max: 20,
				},
				tilt: {
				    max: 20,
				},
				shock: {
				    max: 20,
				},
				battery: {
				    min: 1,
				}
			    }
			}
		    ]
		},
		{
		    id: "su-2",
		    tags: [
			{
			    id: "AI02",
			    thresholds: {
				temperature: {
				    min:20,
				    max:30,
				},
				humidity: {
				    min: 20,
				    max: 30,
				},
				light: {
				    min: 20,
				    max: 30,
				},
				pressure: {
				    min: 20,
				    max: 30,
				},
				tilt: {
				    max: 30,
				},
				shock: {
				    max: 30,
				},
				battery: {
				    min: 2,
				}
			    }
			}
		    ]
		}

	    ]//shippingUnits
	}
    ]//gateways
};

//const baseurl = "http://localhost:3001";
const baseurl = "http://13.64.73.44:3001";
var deskworkertoken = "";
var dockworkertoken = ""
Async.waterfall([
    function(donecb) {
	/* post to /session, get token */
	var posturl = baseurl + "/session";
	Logging.msg("post to: " + posturl);

	Superagent.post(posturl)
	    .send({ username : "deskagent@localhost", password: "deskagent"})
	    .end(function(err, res) {
		if(res && res.ok && res.body) {
		    //Logging.msg("response status: ", res.status);
		    //Logging.msg("response body:", res.body);
		    deskworkertoken = res.body.token;
		    donecb(null);
		}
		//note: I do this because for some reason err is always valid on my
		//posts to /session
		else if(err) {
		    //Logging.msg("err dump,",err);
		    if(err.status){
			Logging.msg("err.status is: ", err.status);
		    }
		    else {
			Logging.msg("No err.status");
		    }
		    donecb("error in post to /session");
		    return;
		}
	    });
    },

    function(donecb) {
	/* post to /session, get token */
	var posturl = baseurl + "/session";
	Logging.msg("post to: " + posturl);

	Superagent.post(posturl)
	    .send({ username : "dockworker@localhost", password: "dockworker"})
	    .end(function(err, res) {
		if(res && res.ok && res.body) {
		    //Logging.msg("response status: ", res.status);
		    //Logging.msg("response body:", res.body);
		    dockworkertoken = res.body.token;
		    donecb(null);
		}
		//note: I do this because for some reason err is always valid on my
		//posts to /session
		else if(err) {
		    //Logging.msg("err dump,",err);
		    if(err.status){
			Logging.msg("err.status is: ", err.status);
		    }
		    else {
			Logging.msg("No err.status");
		    }
		    donecb("error in post to /session");
		    return;
		}
	    });
    },

    function(donecb) {
	/* post to /shipments to create new shipment */
	var posturl = baseurl + "/shipments";
	Logging.msg("post to: " + posturl);

	Superagent.post(posturl)
	    .set("Authorization", "OAuth " + deskworkertoken)
	    .send(shipment_new)
	    .end(function(err,res){
		if(res && res.ok && res.body) {
		    //Logging.msg("res.status:" , res.status);
		    //Logging.msg("res.body:", res.body);
		    var shipmentid = res.body.id;
		    donecb(null, shipmentid);
		}
		else{
		    //Logging.msg("err dump,",err);
		    if(err.status){
			Logging.msg("err.status is: ", err.status);
		    }
		    else {
			Logging.msg("No err.status");
		    }
		    donecb("error in post to /shipments");
		}
	    });
    },
    function(shipmentid, donecb){
	/* put shipment in provision state*/
	var puturl = baseurl + "/shipments/" + shipmentid + "/provision";
	Logging.msg("put to: " + puturl);

	Superagent.put(puturl)
	    .set("Authorization", "OAuth " + dockworkertoken)
	    .send(monitor)
	    .end(function(err,res){
		if(res && res.ok) {
		    if(res.ok){
			//good to go for next function in waterfall
			donecb(null,shipmentid);
		    }
		    else {
			donecb("expected 2xx response, stopping");
		    }
		}
		else {
		    //Logging.msg("err dump,",err);
		    if(err.status){
			Logging.msg("err.status is: ", err.status);
		    }
		    else {
			Logging.msg("No err.status");
		    }
		    if(res.body) {
			Logging.msg("res.body:", res.body);
		    }
		    donecb("error in post to /shipments");
		}
	    });
    },

    function(shipmentid, donecb) {
	/* put shipment in monitor state - monitor object*/
	var puturl = baseurl + "/shipments/" + shipmentid + "/monitor";
	Logging.msg("put to: " + puturl);

	Superagent.put(puturl)
	    .set("Authorization", "OAuth " + dockworkertoken)
	    .send(monitor)
	    .end(function(err,res){
		if(res && res.ok) {
		    //good to go for next function in waterfall
		    donecb(null,shipmentid);
		}
		else {
		    //Logging.msg("err dump,",err);
		    if(err.status){
			Logging.msg("err.status is: ", err.status);
		    }
		    else {
			Logging.msg("No err.status");
		    }
		    if(res.body) {
			Logging.msg("res.body:", res.body);
		    }
		    donecb("error in post to /shipments");
		}
	    });
    },

    function(shipmentid, donecb) {
	/* put monitoring config in there - monitor_config object*/
	var puturl = baseurl + "/shipments/" + shipmentid + "/monitor/config";
	Logging.msg("put to: " + puturl);

	Superagent.put(puturl)
	    .set("Authorization", "OAuth " + deskworkertoken)
	    .send(monitor_config)
	    .end(function(err,res){
		if(res && res.ok) {
		    //good to go for next function in waterfall
		    donecb(null);
		}
		else {
		    //Logging.msg("err dump,",err);
		    if(err.status){
			Logging.msg("err.status is: ", err.status);
		    }
		    else {
			Logging.msg("No err.status");
		    }
		    if(res.body) {
			Logging.msg("res.body:", res.body);
		    }
		    donecb("error in post to /shipments");
		}
	    });
    },

], function(err, results){
    if(err) {
	Logging.msg("error dump: ", err);
	process.exit(1);
	return;
    }
    Logging.msg("success results, ", results);
    process.exit(0);
});
