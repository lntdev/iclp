/*
  File: hooks/index.js

  Description:
  Module for shipping API hook functions.

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging   = require('cccommon/logging').logger("shippingapi-hooks");
Logging.enable();

/* gva common mondules */
const shipDal = require('cccommon/dal/shipment');
const format  = require('cccommon/format');

/* modules that are part of this tool's codebase */
const Commonconfig  = require('cccommon/config');

const pcs2_baseurl = Commonconfig.pcs2.baseurl();

/* modules from external sources */
const Superagent = require('superagent');
const Asynclib   = require('async');

exports.shipment = {};
exports.shipment.create = function(shipmentid, shipmentname) {
    Logging.msg("shipment.create hook");
};

exports.shipment.monitor = function(shipmentid) {

    Logging.msg("shipment.monitor hook, shipmentid: " + shipmentid);

    shipDal.findByPrimaryKey(shipmentid)
	.then(function (shipment) {
	    update_pcs2(shipment);
	}, function (err) {
	    Logging.msg("err getting shipment from dal", err);
	});

    function update_pcs2(shipment) {

 	Logging.msg("shipment dump: ", shipment.toJSON());
	Logging.msg("shipment dump: ", {obj: format.shipment.modelToJson(shipment)});

	Asynclib.waterfall([
    	    /* add our shipment to a new device group on pcs2 */
    	    function(donecb) {

    		var devicegroup_url = pcs2_baseurl + "/config/v1/devicegroups"

    		var devicegroup_req = {
    		    DisplayName : shipmentid + "-" + shipment.shipmentId, //display in UI
    		    Conditions  : [
    			{
    			    Key      : "Properties.Reported.Type",
    			    Operator : "EQ",
    			    Value    : shipmentid.toString(), //must be same as Value in device twin
    			},
    		    ],
    		};

    		Logging.msg("devicegroup creation for " + devicegroup_url + " req:", devicegroup_req);

    		Superagent.post(devicegroup_url)
    		    .send(devicegroup_req)
    		    .end(function(err,res) {
    			if(res && res.status){
    			    Logging.msg("pcs2 rest api response status: ", res.status);
    			    if(res.body) {
    				Logging.msg("psc2 rest api response body:", res.body);
    			    }
    			    donecb(null,res);
    			}
    			else if(err) {
    			    Logging.msg("err dump,",err);
    			    if(err.status){
    				Logging.msg("pcs2 rest api err.status is: ", err.status);
    			    }
    			    else {
    				Logging.msg("pcs2 rest api no err.status.. don't know what happened");
    			    }
    			    donecb("err posting to: " + devicegroup_url + "for shipment id " + shipmentid);
    			}
    		    });
    	    },
    	    function(res, donecb) {
    		var groupid = res.body.Id;
    		const pcs2rules = format.shipment.thresholds2Pcs2Rules(shipment, groupid);
    		Logging.msg("pcs2 rules dump:" , pcs2rules);

    		var rules_url = pcs2_baseurl + "/telemetry/v1/rules"
    		Logging.msg("posting to rules url: ", rules_url);

		/* loop through the collection of rules, posting each to PCS2 */
		Asynclib.each(pcs2rules.rules, function(rule, donecb) {
    		    Superagent.post(rules_url)
    			.send(rule)
    			.end(function(err,res) {
    			    if(res && res.status){
    				Logging.msg("pcs2 rule rest api response status: ", res.status);
    				if(res.body) {
    				    Logging.msg("psc2 rest api response body:", res.body);
    				}
    				donecb(null);
    			    }
    			    else if(err) {
    				Logging.msg("err dump,",err);
    				if(err.status){
    				    Logging.msg("pcs2 rule rest api err.status is: ", err.status);
    				}
    				else {
    				    Logging.msg("pcs2 rule rest api no err.status.. don't know what happened");
    				}
    				donecb("err posting to: " + rules_url + "for shipment id " + shipmentid);
    			    }
    			});
		}, function(err){
		    if(err){
			var msg = "error in looping post for rules";
			Logging.msg(msg);
			donecb(msg);
			return;
		    }
		    donecb(null, "looping post for rules success");
		});
    	    }
    	],function(err, results) {
    	    if(err){
    		Logging.msg("errors updating pcs2, err dump", err);
    		return;
    	    }
    	    Logging.msg("success updating pcs2, results:", results);
    	});
    }
}

exports.shipment.end = function(shipmentid) {
    Logging.msg("shipment.end hook");

    /*
      Note: no cleanup for PCS2 in there, becuase that UI
      can still be used for historical data after the life
      of a particular shipment. Cleanup will be some separate, UI/User driven
      archival process of the following:
      - device group
      - tag devices created in the tag/pcs2 iot hub
      - sensor data in the PCS2 database
    */
};
