/*
  File: devprovtool-config.js

  Description:
  Configuration file for devprovtool.js

  License:
  Intel TODO
*/

'use strict';

/*
  returns connection string for gateway iot hub.

  this should be under the Hub's "Shared Access Policy"
  panel, and should be the "registryReadWrite" entry's
  Connection String
*/
exports.gateway_iot_hub_conn_str = function() {
    /* we pull this out of the environment! */
    if(! process.env.devprovtool_gateway_iot_hub_conn_str ) {
	throw new Error("couldnt find env var devprovtool_gateway_iot_hub_conn_str !");
    }
    return process.env.devprovtool_gateway_iot_hub_conn_str;
};

/*
  returns connection string for the tag/pcs2 iot hub.

  this should be under the Hub's "Shared Access Policy"
  panel, and should be the "registryReadWrite" entry's
  Connection String
*/
exports.tag_iot_hub_conn_str = function() {

    /* we pull this out of the environment! */
    if(! process.env.devprovtool_tag_iot_hub_conn_str ) {
	throw new Error("couldnt find env var devprovtool_tag_iot_hub_conn_str !");
    }
    return process.env.devprovtool_tag_iot_hub_conn_str;
};


/*
  returns a list of *GATEWAY* devices that should be "provisioned" in
  the device registry of the Gateway Iot hub.

  NOTE: all of these are freeform values

  op field can be "add" or "update"
*/
exports.gateway_device_setup = true;
exports.gateway_device_table = function() {
    var table = [
	{op: "add", uuid : "integration-test", easyref: "for devicesime testing" },
	//{op: "update", uuid : "integration-test", easyref: "for devicesime testing" },
    ];

    return table;
};

/*
  returns a list of *TAG* devices that should be "provisioned" in
  the device registry of the TAG / PCS2 Iot hub

  NOTE: all of these are freeform values

  op field can be "add" or "update"
*/
exports.tag_device_setup = true;
exports.tag_device_table = function() {
    var table = [
	{op: "add", uuid : "tag-test", easyref: "test device" },
	//{op: "update", uuid : "tag-test", easyref: "test device " },
    ];

    return table;
};
