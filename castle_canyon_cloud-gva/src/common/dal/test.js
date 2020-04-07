/*
  File: test.js

  Description:
  quick and dirty functional test dal.js

  License:
  Intel TODO

*/
"use strict"

/* logging ..*/
const Logging   = require('cccommon/logging').logger("dal: test.js");
Logging.enable();

const Dal = require('cccommon/dal');

// positive tests
try {

    function t1() {
	Logging.msg("calling Dal.gather_config_change_data()");
	Dal.gather_config_change_data("fake-shippingid", function(err, msglist) {

	    if(err){
		Logging.msg("got error from dal.gather_config_change_data", err);
		process.exit(1);
	    }
	    else{
		for (var entry in msglist){
		    Logging.msg("success, dal.gather_config_change_data, entry " + entry + ":",
				msglist[entry]);
		}
		setImmediate(t2);
	    }
	});
    }

    function t2() {
	Logging.msg("calling Dal.gather_config_change_data()");

	Dal.gather_disassociation_data("fake-shippingid", function(err, msglist) {

	    if(err){
		Logging.msg("got error from dal.gather_disassociation_data", err);
		process.exit(1);
	    }
	    else{
		for (var entry in msglist){
		    Logging.msg("success, dal.gather_config_change_data, entry " + entry + ":",
				msglist[entry]);
		}
		//setImmediate(t3)...
	    }

	});
    }

    setImmediate(t1);

}
catch (err) {
    console.log("positive tests failed!,");
    console.log(err);

    //quit with non-zero to indicate test fail
    process.exit(1);
}

// negative tests
