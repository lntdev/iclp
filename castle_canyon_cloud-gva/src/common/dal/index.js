/*
  File: dal.js

  Description:
  Datasbase / datastore abstraction module used by GVA processes

  License:
  Intel TODO
*/

'use strict';

const Commonconfig = require('cccommon/config');
const Errorlist = require('cccommon/errorlist').errorlist;

const models = require('cccommon/models/internaldb');
const Sequelize = models.Sequelize;

/* gva common mondules */
const shipDal = require('cccommon/dal/shipment');
const format = require('cccommon/format');
const Northsouth = require('cccommon/northsouth');

/* logging ..*/
const Logging = require('cccommon/logging').logger("dal");
Logging.enable();


/**
   gathers data from the internal database required
   to send configuration change messages to the devices
   in the field.

   @param shippingid - the shipping id for which associated
          devices should be configured

   @param cb - callback function with this signature:
          f(err, msgsData)
*/
exports.connect_to_db = function () {
    var dbhost = Commonconfig.internaldb.connection().host;
    var dbname = Commonconfig.internaldb.connection().database;
    var dbuser = Commonconfig.internaldb.connection().username;

    Logging.msg("DB connection details ",
        { dbhost: dbhost, dbname: dbname, dbuser: dbuser });

    /* do DB connection here */
}

/**
   gathers data from the internal database required
   to send configuration change messages to the devices
   in the field.

   @param shippingid - the shipping id for which associated
          devices should be configured

   @param cb - callback function with this signature:
          f(err, msgsData)
*/
exports.gather_config_change_data = function (shippingId, requestBody, cb) {
    Logging.msg("+gather_config_change_data for shipping id: " + shippingId);
    Logging.msg("+original request Body:" + JSON.stringify(requestBody));
    var requestedThresholds = requestBody;
    /**
     * const shipDal = require('cccommon/dal/shipment');
     * const format = require('cccommon/format');
     *
     * // findByPrimaryKey returns a Promise directly from Sequelize.
     * // - Either use `await` and wrap in a try/catch for Promise rejection, OR
     * //   standard Promise API.
     * // - http://docs.sequelizejs.com/manual/installation/getting-started.html#promises
     * const shipment = await shipDal.findByPrimaryKey(shippingid);
     *
     * const formatted = format.shipment.modelToConfigChangeTagData(shipment);
     * console.log({
     *   gatewayId: formatted.gatewayId,
     *   tagWsnIds: formatted.tagWsnIds,
     *   configParams: formatted.configParams
     * });
     *
     * See:
     * - test/common/format/index.js tests:
     *   - should convert model to config change data for GW
     *   - should convert model to disassociation data for GW
     * - common/format/index.js
     *   - exports.shipment.modelToConfigChangeTagData
     *   - exports.shipment.modelToDisassociationData
     */


    /*
      NOTE: some of the case of the variables may look
      inconsistent -- I've taken it that way from the doc
      from intel.
    */
    shipDal.findByPrimaryKey(shippingId).then(function (shipment) {
        if (!shipment) {
            var msg = "failed to retrieve shipment from dal for shipment id: " + shipmentid;
            Logging.msg(msg);
            return;
        }
        var tagList = [];
        shipment.shippingUnits.forEach((shippingUnit, index) => {
            shippingUnit.tags.forEach((tag, indes) => {
                //tagList.push(tag.wsnId)
                tagList.push(tag.uuid);
            })
        });

        var timeNow = Date.now();
        var changeConfigMsg = {
            "msgType": Northsouth.southbound.msgids.configchange,
            "JSON": {
                "time": timeNow,
                "gatewayId": "someGatewayId",
                "shipmentId": shipment.id,
                "messageToken": "someToken",
                "configList": [{
                    "applyToAll": false,
                    "tagList": tagList,
                    "configParams": [{
                        "type": "light",
                        "enableSensor": requestedThresholds.shippingUnits[0].tags[0].thresholds.light.enable,
                        "thrIsValid": true,
                        "thresholds": {
                            "min": requestedThresholds.shippingUnits[0].tags[0].thresholds.light.min,
                            "max": requestedThresholds.shippingUnits[0].tags[0].thresholds.light.max
                        }
                    },
                    {
                        "type": "humidity",
                        "enableSensor": requestedThresholds.shippingUnits[0].tags[0].thresholds.humidity.enable,
                        "thrIsValid": true,
                        "thresholds": {
                            "min": requestedThresholds.shippingUnits[0].tags[0].thresholds.humidity.min,
                            "max": requestedThresholds.shippingUnits[0].tags[0].thresholds.humidity.max
                        }
                    },
                    {
                        "type": "temperature",
                        "enableSensor": requestedThresholds.shippingUnits[0].tags[0].thresholds.temperature.enable,
                        "thrIsValid": true,
                        "thresholds": {
                            "min": requestedThresholds.shippingUnits[0].tags[0].thresholds.temperature.min,
                            "max": requestedThresholds.shippingUnits[0].tags[0].thresholds.temperature.max
                        }
                    },
                    {
                        "type": "pressure",
                        "enableSensor": true,
                        "thrIsValid": true,
                        "thresholds": {
                            "min": requestedThresholds.shippingUnits[0].tags[0].thresholds.pressure.min,
                            "max": requestedThresholds.shippingUnits[0].tags[0].thresholds.pressure.max
                        }
                    },
                    {
                        "type": "battery",
                        "enableSensor": requestedThresholds.shippingUnits[0].tags[0].thresholds.battery.enable,
                        "thrIsValid": true,
                        "thresholds": {
                            "min": requestedThresholds.shippingUnits[0].tags[0].thresholds.battery.min,
                            "max": null
                        }
                    },
                    {
                        "type": "shock",
                        "enableSensor": requestedThresholds.shippingUnits[0].tags[0].thresholds.shock.enable,
                        "thrIsValid": true,
                        "thresholds": {
                            "min": null,
                            "max": requestedThresholds.shippingUnits[0].tags[0].thresholds.shock.max
                        }
                    },
                    {
                        "type": "tilt",
                        "enableSensor": requestedThresholds.shippingUnits[0].tags[0].thresholds.tilt.enable,
                        "thrIsValid": true,
                        "thresholds": {
                            "min": null,
                            "max": requestedThresholds.shippingUnits[0].tags[0].thresholds.tilt.max
                        }
                    }
                    ]
                }]
            }
        };
        var microIntervalChangeMsg = {
            "msgType": Northsouth.southbound.msgids.microIntervalChange,
            "JSON": {
                "time": (timeNow + 1), // hack to overcome, timestamp check in GW
                "gatewayId": "someGatewayId",
                "shipmentId": shipment.id,
                "messageToken": "someToken",
                "microInterval": requestedThresholds.tag2GwReportingTime
            }
        };
        var macroIntervalChangeMsg = {
            "msgType": Northsouth.southbound.msgids.macroIntervalChange,
            "JSON": {
                "time": (timeNow + 2), //hack to overcome, timestamp check in GW
                "gatewayId": "someGatewayId",
                "shipmentId": shipment.id,
                "messageToken": "someToken",
                "macroInterval": requestedThresholds.gw2CloudReportingTime
            }
        };
        var msgList = [];
        msgList.push(changeConfigMsg);
        msgList.push(microIntervalChangeMsg);
        msgList.push(macroIntervalChangeMsg);
        //put it on the event loop so other stuff can run before the callback
        setImmediate(cb, null, msgList);
    }, function (err) {
        Logging.msg("error getting data: ", err)
    });
};

/**
   gathers data from the internal database required
   to send disassociation messages to the devices
   in the field.

   @param shippingid - the shipping id for which devices
          should now be disassociated from a shipment

   @param cb - callback function with this signature:
          f(err, msgsData)
*/
exports.gather_disassociation_data = function (shippingId, cb) {

    /**
     * const shipDal = require('cccommon/dal/shipment');
     * const format = require('cccommon/format');
     *
     * // findByPrimaryKey returns a Promise directly from Sequelize.
     * // - Either use `await` and wrap in a try/catch for Promise rejection, OR
     * //   standard Promise API.
     * // - http://docs.sequelizejs.com/manual/installation/getting-started.html#promises
     * const shipment = await shipDal.findByPrimaryKey(shippingid);
     *
     * const formatted = format.shipment.modelToDisassociationData(shipment);
     * console.log({
     *   gatewayId: formatted.gatewayId,
     *   tagWsnIds: formatted.tagWsnIds
     * });
     *
     * See:
     * - test/common/format/index.js tests:
     *   - should convert model to config change data for GW
     *   - should convert model to disassociation data for GW
     * - common/format/index.js
     *   - exports.shipment.modelToConfigChangeTagData
     *   - exports.shipment.modelToDisassociationData
     */
    shipDal.findByPrimaryKey(shippingId).then(function (shipment) {
        if (!shipment) {
            var msg = "failed to retrieve shipment from dal for shipment id: " + shipmentid;
            Logging.msg(msg);
            setImmediate(cb, msg, null);
            return;
        }
        var disMsgList = [
            {
                time: Date.now(),
                gatewayId: shipment.gateways[0].uuid,
                shipmentId: shipment.id,
                messageToken: "token",
                applyToAll: true,
                tagList: []
            }];

        //put it on the event loop so other stuff can run before the callback
        setImmediate(cb, null, disMsgList);
    });
};

exports.user = require('./user');
exports.shipment = require('./shipment');
exports.error = {
    ValidationError: Sequelize.ValidationError
}
exports.getTransaction = () => {
    return models.sequelize.transaction();
};

exports.gather_shipment_data_by_id = function (shippingId, cb) {
    Logging.msg("+gather_shipment_data_by_id for shipping id: " + shippingId);

    /*
      NOTE: some of the case of the variables may look
      inconsistent -- I've taken it that way from the doc
      from intel.
    */
    shipDal.findByPrimaryKey(shippingId).then(function (shipment) {
        if (!shipment) {
            var msg = "failed to retrieve shipment from dal for shipment id: " + shipmentid;
            Logging.msg(msg);
            return;
        }
        //Logging.msg("Shipment Data : " + JSON.stringify(shipment));

        //put it on the event loop so other stuff can run before the callback
        setImmediate(cb, null, shipment);
    }, function (err) {
        Logging.msg("error getting data: ", err)
    });
};
