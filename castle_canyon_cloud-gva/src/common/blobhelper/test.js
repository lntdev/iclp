/*
  File: test.js


  Description:
  Test code for Common blob storage helper for GVA modules

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging   = require('cccommon/logging').logger("blobhelper-test");
Logging.enable();

const Async = require('async');

const Blobhelper = require('cccommon/blobhelper').helper("blob-test");
const b64img1 = require('testimagedata.js').jpg1;
const b64img2 = require('testimagedata.js').jpg2;

var blobUrl = null;

Async.waterfall([
    function(donecb) {
	Blobhelper.uploadBlob(
	    b64img1,
	    "image/jpeg",
	    function(err, url) {
		if(err) {
		    Logging.msg("error uploading blob , err dump: ", err);
		    donecb("error uploading");
		    return;
		}

		Logging.msg("success uploading blob, url: " + url);
		blobUrl = url;
		donecb(null, url);
	    });
    },
    function(url, donecb){
    	Blobhelper.replaceBlob(
    	    url,
    	    b64img2,
    	    "image/jpeg",
    	    function(err){
    		if(err) {
    		    Logging.msg("error replacing blob , err dump: ", err);
    		    donecb("error replacing");
    		    return;
    		}

    		Logging.msg("success replacing blob, url: " + blobUrl);
    		donecb(null, url);
    	    });
    },
    function(url, donecb) {
    	Blobhelper.deleteBlob(
    	    blobUrl,
    	    function(err) {
    		if(err) {
    		    Logging.msg("error deleting blob , err dump: ", err);
    		    donecb("error deleting");
    		    return;
    		}

    		Logging.msg("success deleting blob, url: " + blobUrl);
    		donecb(null);
    	    });
    }
],function(err, results){
    if(err) {
	Logging.msg("error dump: ", err);
	process.exit(1);
	return;
    }
    Logging.msg("success");
    process.exit(0);
});
