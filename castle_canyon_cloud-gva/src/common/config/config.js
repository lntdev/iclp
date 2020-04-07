/*
  File: config.js

  Description:
  central configuration repository for access to ALL configuration for the GVA

  this allows :
  1. GVA code pull config values from a common module.
  2. a singlular place to manage configuration inputs for devs and devops.
  3. allows the code to handle config inputs for different deployment setups
     b. values pulled in via env vars set on local VM
     c. values pulled in via env vars set via IaaS api or container orchestation system

  License:
  Intel TODO

  !!!!!!!!!!! MODIFYING HOWTO !!!!!!!!!!!!!

  All configuraiton items should be exposed through a function!
  - this allows us to wire up that function to some other source for the
    data ex: static entry vs environment var.

*/

'use strict';

/******************************************************************************
subsystem : logging
******************************************************************************/
exports.logging = {};
exports.logging.build_info = function() {
    return "GVA_CT_30.01.22";
}
exports.logging.env_info = function() {
    if(! process.env.gva_logging_env_info ) {
	throw new Error("couldnt find env var gva_logging_env_info !");
    }
    return process.env.gva_logging_env_info;
}
exports.logging.appinsights_instrumentation_key = function() {
    if(! process.env.gva_logging_appinsights_instrumentation_key ) {
	throw new Error("couldnt find env var gva_logging_appinsights_instrumentation_key !");
    }
    return process.env.gva_logging_appinsights_instrumentation_key;
}

/******************************************************************************
subsystem : devicesim
******************************************************************************/
exports.devicesim = {};
exports.devicesim.iothub_device_connect_str = function() {

    if(! process.env.gva_devicesim_iothub_device_connect_str ) {
	throw new Error("couldnt find env var gva_devicesim_iothub_device_connect_str !");
    }
    return process.env.gva_devicesim_iothub_device_connect_str;
};

/******************************************************************************
subsystem : GW Communication
******************************************************************************/
exports.gwcomm = {};
exports.gwcomm.method = function () {
    if(! process.env.gva_gw_connection_type) {
        throw new Error("could not find env var gva_gw_connection_type !");
    }
    return process.env.gva_gw_connection_type;
}

/******************************************************************************
subsystem : IoT Central
******************************************************************************/
exports.gwcomm.iotc_uri = function () {
    if(! process.env.gva_iotc_uri) {
        throw new Error("could not find env var gva_iotc_uri !");
    }
    return process.env.gva_iotc_uri;
}
exports.gwcomm.iotc_scope_id = function () {
    if(! process.env.gva_iotc_scope_id) {
        throw new Error("could not find env var gva_iotc_scope_id !");
    }
    return process.env.gva_iotc_scope_id;
}
exports.gwcomm.iotc_sas_master_key = function () {
    if(! process.env.gva_iotc_sas_master_key) {
        throw new Error("could not find env var gva_iotc_sas_master_key !");
    }
    return process.env.gva_iotc_sas_master_key;
}
exports.gwcomm.iotc_devcie_template_id = function () {
    if(! process.env.gva_iotc_device_template_id) {
        throw new Error("could not find env var gva_iotc_device_template_id !");
    }
    return process.env.gva_iotc_device_template_id;
}
exports.gwcomm.iotc_devcie_interface_id = function () {
    if(! process.env.gva_iotc_device_interface_id) {
        throw new Error("could not find env var gva_iotc_device_interface_id !");
    }
    return process.env.gva_iotc_device_interface_id;
}
exports.gwcomm.iotc_app_api_token = function () {
    if(! process.env.gva_iotc_app_api_token) {
        throw new Error("could not find env var gva_iotc_app_api_token !");
    }
    return process.env.gva_iotc_app_api_token;
}
exports.gwcomm.iotc_event_hub_name = function () {
    if(! process.env.gva_iotc_event_hub_name) {
        throw new Error("could not find env var gva_iotc_event_hub_name !");
    }
    return process.env.gva_iotc_event_hub_name;
}
exports.gwcomm.iotc_event_hub_compatible_endpoint = function () {
    if(! process.env.gva_iotc_event_hub_compatible_endpoint) {
        throw new Error("could not find env var gva_iotc_event_hub_compatible_endpoint !");
    }
    return process.env.gva_iotc_event_hub_compatible_endpoint;
}

/******************************************************************************
subsystem : IoT Hub
******************************************************************************/
exports.gwcomm.iothub_event_hub_compatible_endpoint = function() {
    if(! process.env.gva_iothub_event_hub_compatible_endpoint ) {
        throw new Error("could not find env var gva_iothub_event_hub_compatible_endpoint !");
    }
    return process.env.gva_iothub_event_hub_compatible_endpoint;
};
exports.gwcomm.iothub_event_hub_name = function() {
    if(! process.env.gva_iothub_event_hub_name) {
        throw new Error("could not find env var gva_iothub_event_hub_name !");
    }
    return process.env.gva_iothub_event_hub_name;
};
exports.gwcomm.iothub_service_policy_connect_str = function() {
    if(! process.env.gva_iothub_service_policy_connect_str) {
        throw new Error("could find env var gva_iothub_service_policy_connect_str !");
    }
    return process.env.gva_iothub_service_policy_connect_str;
};

/******************************************************************************
subsystem : gwlistener
******************************************************************************/
exports.gwlistener = {};
exports.gwlistener.store_data = function() {
    if(! process.env.gva_gwlistener_store_data ) {
	throw new Error("could not find env var gva_gwlistener_store_data !");
    }
    return process.env.gva_gwlistener_store_data;
};

/******************************************************************************
subsystem : gwtagproxy
******************************************************************************/
exports.gwtagproxy = {};
exports.gwtagproxy.iothub_registry_rw_connect_str = function() {

    if(! process.env.gva_gwtagproxy_iothub_registry_rw_connect_str ) {
	throw new Error("couldnt find env var gva_gwtagproxy_iothub_registry_rw_connect_str !");
    }
    return process.env.gva_gwtagproxy_iothub_registry_rw_connect_str;
};

/******************************************************************************
subsystem : gwmessenger
******************************************************************************/
exports.gwmessenger = {};
exports.gwmessenger.url = () => {
  const root = 'http://localhost:3000';
  const event = `${root}/event`;
  return {
    configchange: () => { return `${event}/configchange`; },
    disassociate: () => { return `${event}/disassociate`; },
    startReceving: () => { return `${event}/startReceving`; },
    rebootgateway: () => {return `${event}/rebootgateway`; },
    uploadDiagnosticConfig: () => { return `${event}/uploadDiagnosticConfig`; },
    calibrategateway: () => {return `${event}/calibrategateway`; },
    channelchangegateway: () => {return `${event}/channelchangegateway`; },
    airplanemode: () => {return `${event}/airplanemode`; },
    addtagresponse: () => {return `${event}/addtagresponse`;},
    removetag: () => {return `${event}/removetag`;}
  };
};
exports.gwmessenger.test_device_id = function() {
    if(! process.env.gva_gwmessenger_test_device_id) {
	throw new Error("could find env var gva_gwmessenger_test_device_id!");
    }
    return process.env.gva_gwmessenger_test_device_id;
};

/******************************************************************************
subsystem : pcs2 (not supoorted any longer)
******************************************************************************/
exports.pcs2 = {};
exports.pcs2.baseurl = function() {
    if(! process.env.gva_pcs2_rest_baseurl) {
	throw new Error("could find env var gva_pcs2_rest_baseurl !");
    }
    return process.env.gva_pcs2_rest_baseurl;
};

/******************************************************************************
subsystem : gwtelemetry
******************************************************************************/
exports.gwtelemetry = {};



/******************************************************************************
subsystem : internaldb
******************************************************************************/
exports.internaldb = {
    connection: () => {

	if((! process.env.gva_internaldb_username) ||
	   (! process.env.gva_internaldb_password) ||
	   (! process.env.gva_internaldb_database) ||
	   (! process.env.gva_internaldb_host)) {
	    throw new Error("could find one or more of env vars: gva_internaldb_username," +
			    " gva_internaldb_password, gva_internaldb_database, gva_internaldb_host, SET THESE!!");
	}

	var username = process.env.gva_internaldb_username;
	var usercode = process.env.gva_internaldb_password;
	var database = process.env.gva_internaldb_database;
	var host     = process.env.gva_internaldb_host;

      return {
        logging: false,
        username: username,
        usercode: usercode,
        password: usercode,
        database: database,
        host    : host,

        dialect: 'mssql',
        ssl: true,
        dialectOptions: {
          ssl: true,
          encrypt: true
        },

        pool: {
          max: 100,
          min: 0,
          // Milliseconds of idleness before a connection is eligible for eviction
          idle: 500,
          // How often, in milliseconds, "evictor" logic runs and evicts based on other config
          evict: 250
        },

      };
    }
};

/******************************************************************************
subsystem : https
******************************************************************************/
exports.https = {};
exports.https.enable = function() {
    if(! process.env.gva_https ) {
        throw new Error("could not find env var gva_https !");
    }
    return process.env.gva_https;
};
exports.https.crt_file = function() {
    if(! process.env.gva_https_crt_file) {
        throw new Error("could not find env var gva_https_crt_file !");
    }
    return process.env.gva_https_crt_file;
};
exports.https.key_file = function() {
    if(! process.env.gva_https_key_file) {
        throw new Error("could not find env var gva_https_key_file !");
    }
    return process.env.gva_https_key_file;
};
exports.https.ca_bundle_file = function() {
    if(! process.env.gva_https_ca_bundle_file) {
        throw new Error("could not find env var gva_https_ca_bundle_file !");
    }
    return process.env.gva_https_ca_bundle_file;
};

/******************************************************************************
subsystem : shippingapi
******************************************************************************/
exports.shippingapi = {
  exposeDeveloperEndpoints: () => {
	   return process.env.gva_shippingapi_expose_developer_endpoints === 'YES_ALLOW_USERS_TO_DELETE_ALL_SHIPMENTS_FOR_DEVELOPMENT_OR_INTEGRATION_TESTING';
  },
  photo: {
    blobhelper: {
      container: () => {
        // - Must already exist.
        // - Must be DNS compatible: https://docs.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata
        return 'shipment-photos';
      }
    }
  },
  http: () => {
    const cors = {};

    // Comma-separated list of Access-Control-Allow-Origin host strings.
    if (process.env.gva_shippingapi_http_cors_origin) {
      cors.origin = process.env.gva_shippingapi_http_cors_origin;
    }

    let port;
    if (process.env.gva_shippingapi_ip_port)
       port = process.env.gva_shippingapi_ip_port;
    else
       port = '3001';

    return {
      json: () => {
        return {
          limit: '5mb'
        };
      },
      cors: cors,

      // All these will be hard-coded for December because the needs in development
      // will be the same for integration/trial, which is debuggability/troubleshooting
      // over the performance cost of file I/O.
      requestLog: {
        enabled: true,
        scope: {
          body: true,
          headers: true,
          query: true
        }
      },

      // This too will be hard-coded for December. No current need for customizability.
      port: parseInt(port, 10)
    };
  }
};

/******************************************************************************
subsystem : keystore
******************************************************************************/
exports.keystore = {
  http: () => {
    const cors = {};

    // Comma-separated list of Access-Control-Allow-Origin host strings.
    // currently reusing the shipping definations, TODO: change for furutre use
    if (process.env.gva_shippingapi_http_cors_origin) {
      cors.origin = process.env.gva_shippingapi_http_cors_origin;
    }

    let port;
    if (process.env.gva_keystore_ip_port)
       port = process.env.gva_keystore_ip_port;
    else
       port = '3002';

    return {
      json: () => {
        return {
          limit: '5mb'
        };
      },
      cors: cors,

      // All these will be hard-coded because the needs in development
      // will be the same for integration/trial, which is debuggability/troubleshooting
      // over the performance cost of file I/O.
      requestLog: {
        enabled: true,
        scope: {
          body: true,
          headers: true,
          query: true
        }
      },

      // Currently hard-coded. No current need for customizability.
      port: parseInt(port,10)
    };
  }
};

/******************************************************************************
subsystem : externaldb
******************************************************************************/
exports.externaldb = {};
exports.externaldb.auth = function() {
  if ((!process.env.gva_externaldb_username) ||
    (!process.env.gva_externaldb_password)) {
    throw new Error("could find one or more of env vars: gva_externaldb_username," +
      " gva_externaldb_password, SET THESE!!");
  }
  return {
    auth: {
      user: process.env.gva_externaldb_username,
      password: process.env.gva_externaldb_password,
    }
  };
};

exports.externaldb.uri = function() {
  if (!process.env.gva_externaldb_connection_string) {
    throw new Error("could find one or more of env vars: gva_externaldb_connection_string, SET IT!!");
  }

  return process.env.gva_externaldb_connection_string;
};

/******************************************************************************
subsystem : security
******************************************************************************/
exports.security = {};
exports.security.basePath = function() {
    if(! process.env.gva_security_base_path) {
        throw new Error("could find env var gva_security_base_path !");
    }
    return process.env.gva_security_base_path;
};
exports.security.enable = function() {
    if(! process.env.gva_security) {
        throw new Error("could find env var gva_security !");
    }
    if (process.env.gva_security == "enable")
    	return true;
    return false;
};

/******************************************************************************
subsystem : keystore
******************************************************************************/
exports.deviceKeystore = {};
exports.deviceKeystore.uri = function() {
    if(! process.env.gva_keystore_uri) {
        throw new Error("could find env var gva_keystore_uri !");
    }
    return process.env.gva_keystore_uri;
};

/******************************************************************************
subsystem : SMS Alerts
******************************************************************************/
exports.smsAlerts = {};
exports.smsAlerts.accountSid = function() {
    if(! process.env.gva_sms_alert_account_sid) {
        throw new Error("could find env var gva_sms_alert_account_sid !");
    }
    return process.env.gva_sms_alert_account_sid;
};
exports.smsAlerts.authToken = function() {
    if(! process.env.gva_sms_alert_auth_token) {
        throw new Error("could find env var gva_sms_alert_auth_token !");
    }
    return process.env.gva_sms_alert_auth_token;
};
exports.smsAlerts.registeredPhoneNumber = function() {
    if(! process.env.gva_sms_alert_phone_number) {
        throw new Error("could find env var gva_sms_alert_phone_number !");
    }
    return process.env.gva_sms_alert_phone_number;
};
exports.smsAlerts.enable = function() {
    if(! process.env.gva_sms_alerts) {
        throw new Error("could find env var gva_sms_alerts !");
    }
    if (process.env.gva_sms_alerts == "enable")
    	return true;
    return false;
};

/******************************************************************************
subsystem : Geolocation API
******************************************************************************/
exports.geolocationApi = {};
exports.geolocationApi.key = function() {
    if(! process.env.gva_geolocation_api_key) {
        throw new Error("could find env var gva_geolocation_api_key !");
    }
    return process.env.gva_geolocation_api_key;
};

/******************************************************************************
subsystem : blob storage (depricated)
******************************************************************************/
//exports.blobstore = {};
//exports.blobstore.connect_str = function() {
//    if(! process.env.gva_blobstore_connect_str ) {
//        throw new Error("couldnt find env var gva_blobstore_connect_str !");
//    }
//    return process.env.gva_blobstore_connect_str;
//}
