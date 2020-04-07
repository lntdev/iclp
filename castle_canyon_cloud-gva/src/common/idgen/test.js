/*
  File: test.js

  Description:
  quick and dirty functional test idgen.js

  License:
  Intel TODO

*/
"use strict"

const idgen = require('cccommon/idgen');

// positive tests
try {
    console.log("first gw_panid : "    + idgen.get_gw_panid().toString(16));
    console.log("high gw_panid : "     + idgen.get_gw_panid(0xFFFE).toString(16));
    console.log("rollover gw_panid : " + idgen.get_gw_panid(0xFFFF).toString(16));

    console.log("first gw_wsnid : "    + idgen.get_gw_wsnid().toString(16));
    console.log("high gw_wsnid : "     + idgen.get_gw_wsnid(0xFFFE).toString(16));
    console.log("rollover gw_wsnid : " + idgen.get_gw_wsnid(0xFFFF).toString(16));

    console.log("first tag_wsnid : "    + idgen.get_tag_wsnid().toString(16));
    console.log("high tag_wsnid : "     + idgen.get_tag_wsnid(0xFFFE).toString(16));
    console.log("rollover tag_wsnid : " + idgen.get_tag_wsnid(0xFFFF).toString(16));
}
catch (err) {
    console.log("positive tests failed!,");
    console.log(err);

    //quit with non-zero to indicate test fail
    process.exit(1);
}

// negative tests
try {
    console.log("bogus arg to gw_panid : " + idgen.get_gw_panid("blow up"));

    // quit with non-zero to indicate test fail
    console.log("negative test failed!,");
    process.exit(1);
}
catch(err){
    console.log("negative test pass, got error with non number arg");
    console.log("Error message: " + err.message);
}

try {
    console.log("bogus arg to gw_wsnid : " + idgen.get_gw_wsnid("blow up"));

    // quit with non-zero to indicate test fail
    console.log("negative test failed!,");
    process.exit(1);
}
catch(err){
    console.log("negative test pass, got error with non number arg");
    console.log("Error message: " + err.message);
}

try {
    console.log("bogus arg to tag_wsnid : " + idgen.get_tag_wsnid("blow up"));

    // quit with non-zero to indicate test fail
    console.log("negative test failed!,");
    process.exit(1);
}
catch(err){
    console.log("negative test pass, got error with non number arg");
    console.log("Error message: " + err.message);
}
