/*
  File: blobhelper.js


  Description:
  Common blob storage helper for GVA modules

  License:
  Intel TODO

*/

'use strict';

const util = require('util');

/* logging ..*/
const Logging   = require('cccommon/logging').logger("blobhelper");
Logging.enable();

/* modules that are part of this tool's codebase */
const Commonconfig  = require('cccommon/config');

const Duplex  = require('stream').Duplex;
const crypto  = require('crypto');
const { URL } = require('url');

/* azure stuff */
var azstorage = require('azure-storage');

exports.helper = function(containerName) {

    var rethelper = (function() {

	var useContainer = containerName;
	var connstr      = Commonconfig.blobstore.connect_str();
	var blobservice  = azstorage.createBlobService(connstr);
	var blobbaseurl  = blobservice._getUrl();

	function blobNameFromUrl(url){
	    var parseUrl = new URL(url);
	    var blobpath = parseUrl.pathname;
	    var blobname = blobpath.lastIndexOf("/") !== -1 ?
		blobpath.substr(blobpath.lastIndexOf("/") + 1) :
		blobname;
	    return blobname;
	}

	function uploadBlob(b64strdata, contentType, callback) {

	    Logging.msg("+uploadBlob container: " + useContainer);

	    var b64buff = Buffer.from(b64strdata, 'base64');

	    var hash = crypto.createHash('md5');
	    hash.update(b64buff);
	    var digeststr = hash.digest('hex');

	    var stream = new Duplex();
	    stream.push(b64buff);
	    stream.push(null);

	    var blobname = digeststr;
	    blobname +=  (contentType.indexOf("/") !== -1 ) ?
		"." + contentType.substr(contentType.indexOf("/") + 1) :
		".unknown";

	    function blobcb(err, res, opresp) {
	    	if(err) {
	    	    Logging.msg("error creating block blob");
	    	    callback(err);
	    	    return;
	    	}

		var fullurl = blobservice._getUrl() + useContainer + "/" + blobname;
		Logging.msg("success creating block blob: " + fullurl);

	    	callback(null, fullurl);
	    };

	    Logging.msg("calling createBlockBlobFromStream, " + useContainer + "/" + blobname);

	    /* re hash to get base64 digest */
	    hash = crypto.createHash('md5');
	    hash.update(b64buff);

	    blobservice.createBlockBlobFromStream(useContainer,
	    					  blobname,
	    					  stream,
	    					  b64buff.length,
	    					  {
	    					      contentSettings : {
	    						  contentType : contentType,
	    						  contentMD5  : hash.digest('base64'),
	    					      }
	    					  },
	    					  blobcb);

	};
  uploadBlob[util.promisify.custom] = (b64strdata, contentType) => {
    return new Promise((resolve, reject) => {
      uploadBlob(b64strdata, contentType, (err, url) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(url);
      });
    });
  };


	function replaceBlob (url, b64strdata, contentType, callback) {

	    Logging.msg("+replaceBlob container: " + useContainer);

	    /* ensure url starts with base url + current container */
	    var containerurl = blobbaseurl + useContainer + "/";
	    if(url.startsWith(containerurl) === false){
		callback("url must be to this container: " + containerurl);
		return;
	    }

	    var blobname = blobNameFromUrl(url);
	    Logging.msg("blobname from url is: " + blobname);

	    var b64buff = Buffer.from(b64strdata, 'base64');
	    var hash = crypto.createHash('md5');
	    hash.update(b64buff);

	    var stream = new Duplex();
	    stream.push(b64buff);
	    stream.push(null);

	    //Logging.msg("stream dump: ", stream);
	    Logging.msg("buffer length: " + b64buff.length);


	    function blobcb(err, res, opresp) {
	    	if(err) {
	    	    Logging.msg("error creating block blob");
	    	    callback({err: err, opresp: opresp});
	    	    return;
	    	}

		var fullurl = blobservice._getUrl() + useContainer + "/" + blobname;
		Logging.msg("success replacing block blob: " + fullurl);

	    	callback(null, fullurl);
	    };

	    Logging.msg("calling createBlockBlobFromStream, " + useContainer + "/" + blobname);

	    blobservice.createBlockBlobFromStream(useContainer,
	    					  blobname,
	    					  stream,
	    					  b64buff.length,
	    					  {
	    					      contentSettings : {
	    						  contentType : contentType,
	    						  contentMD5  : hash.digest('base64'),
	    					      }
	    					  },
	    					  blobcb);

	};
  replaceBlob[util.promisify.custom] = (url, b64strdata, contentType) => {
    return new Promise((resolve, reject) => {
      replaceBlob(url, b64strdata, contentType, (err, url) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(url);
      });
    });
  };

	function deleteBlob (url, callback) {
	    Logging.msg("+deleteBlob container: " + useContainer);

	    /* ensure url starts with base url + current container */
	    var containerurl = blobbaseurl + useContainer + "/";
 	    if(url.startsWith(containerurl) === false){
		callback("url must be to this container: " + containerurl);
		return;
	    }

	    var blobname = blobNameFromUrl(url);
	    Logging.msg("blobname from url is: " + blobname);

	    function blobcb(err, res, opresp) {
	    	if(err) {
	    	    Logging.msg("error deleting block blob");
	    	    callback({err: err, opresp: opresp});
	    	    return;
	    	}
	    	callback(null);
	    };

	    Logging.msg("calling deleteBlob, " + useContainer + "/" + blobname);

	    blobservice.deleteBlob(useContainer,
	    			   blobname,
	    			   blobcb);

	};
  deleteBlob[util.promisify.custom] = (url) => {
    return new Promise((resolve, reject) => {
      deleteBlob(url, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  };

	return {
	    uploadBlob  : uploadBlob,
	    uploadBlobPromisified: util.promisify(uploadBlob),
	    replaceBlob : replaceBlob,
	    replaceBlobPromisified: util.promisify(replaceBlob),
	    deleteBlob  : deleteBlob,
	    deleteBlobPromisified: util.promisify(deleteBlob)
	};
    })();

    return rethelper;
};
