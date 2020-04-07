/*
  File: eventrx.js

  Description:
  Internal event receiver module - receives events from internal
  Gateway Virtual Appliance (GVA) processes (ex. API processes).

  License:
  Intel TODO

*/

'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("eventrx");
Logging.enable();

/* modules that are part of this tool's codebase */
const Commonconfig = require('cccommon/config');
const Errorlist = require('cccommon/errorlist').errorlist;
const Northsouth = require('cccommon/northsouth');
const Inputvalidate = require('./inputvalidation');
const Dal = require('cccommon/dal');
const GwComms = require('cccommon/gwcomms');
const shipDal = Dal.shipment;

/* misc utility modules from npmjs.org */
const express = require('express');

const sensorDataDal = require('cccommon/dal/sensordata');

/* Azure related -- IoT hub and friends (also from npmjs.org */


/**
   run the event receiver loop

   errorcb : function f(err : {msg : "messags string", code : number})

   @return nothing
*/
exports.run = function (errorcb) {

    Logging.msg("+run()");

    /* connect to the internal db */
    Dal.connect_to_db();


    var sendoptions = {
        callername: "gwmessenger/eventrx",
    };

    /**
       event endpoint handler

       route: /event/:id

       request payload template:
       {
           "requestId"  : "string: internal request id value for end to end tracking"
           "shipmentId" : "string: shipping id value",
       }
    */
    async function event_endpoint(req, res) {

        Logging.msg("+event_endpoint: " + req.originalUrl);
        //Logging.msg("params dump:", req.params);
        //Logging.msg("body dump:", req.body);

        /* this table maps endpoint path part that represents the event id to the
           function that handles that event */
        const event_table = {
            test: test_event_handler,
            configchange: configchange_event_handler,
            disassociate: disassociate_event_handler,
            rebootgateway: reboot_gateway_event_handler,
            uploadDiagnosticConfig: upload_Diagnostic_Config_event_handler,
            calibrategateway: calibrate_gateway_event_handler,
            channelchangegateway: channel_change_gateway_event_handler,
            airplanemode: airplane_mode_gateway_event_handler,
            startReceving: startReceving_event_handler,
            addtagresponse: require('./eventhandlers/addtagresponse'),
            removetag: require('./eventhandlers/removetag')
        };

        if (event_table[req.params.id] === undefined) {
            complete_error(Errorlist.noeventid);
            return;
        }

        var response;
        try {
            Logging.msg('request: ' + JSON.stringify(req.body));
            /* input validation on common fields for all events */
            if (req.params.id != 'rebootgateway' &&
                req.params.id != 'calibrategateway' &&
                req.params.id != 'channelchangegateway' &&
                req.params.id != 'airplanemode' &&
                req.params.id != 'addtagresponse' &&
                req.params.id != 'removetag' &&
                req.params.id != 'uploadDiagnosticConfig')
                Inputvalidate.event.shipmentid(req.body);
            else
                Inputvalidate.event.gatewayid(req.body);

            Inputvalidate.event.requestid(req.body);

            //debug
            Logging.msg("event(" + req.params.id + "),shippingid(" + req.body.shipmentId + ")");
            Logging.msg("event(" + req.params.id + "),gatewayid(" + req.body.gatewayId + ")");

            /* call the event handler based on id, pass request body as params */
            response = await event_table[req.params.id](req.body);
            Logging.msg("res: " + JSON.stringify(response));
            if (response.status == "Fail")
                complete_error(response);
        } catch (err) {
            Logging.msg("caught err while processing event from table..", err);
            complete_error(err.errorlist_entry);
            return;
        }

        /* success path ...*/
        res.status(200).json(response);

        /* short circuit logic above will call this */
        function complete_error(errorlist_entry) {
            res.status(400).json(errorlist_entry);
        }
    }

    /**
       a simple test endpoint -- during dev time - will remove shortly
     */
    function test_event_handler(eventdetails) {
        //db test here
        Logging.msg("sending: " + Northsouth.southbound.msgids.test);

        //NOTE: use gwmessenger.test_device_id() is TEMPORARY
        GwComms.sendGwMsg(
            sendoptions,
            Commonconfig.gwmessenger.test_device_id(), {
            properties: {
                northsouth_msgid: Northsouth.southbound.msgids.test,
                egg: "ladies and gentleman, start your engines!",
            },
            data: {
                msgType: Northsouth.southbound.msgids.test,
                JSON: {
                    echo: "echo A55A",
                    ShipmentId: eventdetails.shipmentId,
                    gen: true // this will cause it to generate a bunch of D2C messages
                },
            },
        });
    }

    /**
       Reboot GW endpoint --
       Generates reboot GW JSON messages to sent as C2D message via IOT HUB
     */
    async function reboot_gateway_event_handler(eventdetails) {
        Logging.msg("reboot: " + Northsouth.southbound.msgids.rebootGateway);
        const gatewayId = eventdetails.gatewayId;
        Logging.msg("gateway ID: " + gatewayId);
        var response = {};

        await GwComms.sendGwMsg(
            sendoptions,
            gatewayId, {
            properties: {
                northsouth_msgid: Northsouth.southbound.msgids.rebootGateway,
            },
            data: {
                msgType: Northsouth.southbound.msgids.rebootGateway,
                JSON: {
                    time: Date.now(),
                    gatewayId: gatewayId,
                    messageToken: "messageToken"
                },
            },
        })
            .then(function (reason) {
                Logging.msg("Result Pass: " + reason);
                response = {
                    status: "Pass",
                    details: reason
                };
            })
            .catch(function (reason) {
                Logging.msg("Result Error: " + reason);
                response = {
                    status: "Fail",
                    details: reason
                };
            })
        return response;
    }

    /**
       Upload Diagnostic Config endpoint
       Generates Diagnostic JSON messages to sent as C2D message via IOT HUB
     */
    async function upload_Diagnostic_Config_event_handler(eventdetails) {

        Logging.msg("Upload Diagnostic Config " + Northsouth.southbound.msgids.uploadDiagnosticConfig);
        const gatewayId = eventdetails.gatewayId;
        const connStr = eventdetails.connStr;
        Logging.msg("gateway ID: " + gatewayId);
        var response = {};

        await GwComms.sendGwMsg(
            sendoptions,
            gatewayId, {
            properties: {
                northsouth_msgid: Northsouth.southbound.msgids.uploadDiagnosticConfig,
            },
            data: {
                msgType: Northsouth.southbound.msgids.uploadDiagnosticConfig,
                JSON: {
                    time: Date.now(),
                    gatewayId: gatewayId,
                    messageToken: "messageToken",
                    diagnosticBlobConnectionString: connStr
                },
            },
        })
            .then(function (reason) {
                Logging.msg("Result Pass: " + reason);
                response = {
                    status: "Pass",
                    details: reason
                };
            })
            .catch(function (reason) {
                Logging.msg("Result Error: " + reason);
                response = {
                    status: "Fail",
                    details: reason
                };
            })
        return response;
    }

    /**
       Calibrate GW endpoint --
       Generates Caliberate JSON messages to sent as C2D message via IOT HUB
     */
    async function calibrate_gateway_event_handler(eventdetails) {
        Logging.msg("calibrate: " + Northsouth.southbound.msgids.calibrateGateway);
        const gatewayId = eventdetails.gatewayId;
        Logging.msg("gateway ID: " + gatewayId);
        var response = {};

        await GwComms.sendGwMsg(
            sendoptions,
            gatewayId, {
            properties: {
                northsouth_msgid: Northsouth.southbound.msgids.calibrateGateway,
            },
            data: {
                msgType: Northsouth.southbound.msgids.calibrateGateway,
                JSON: {
                    time: Date.now(),
                    gatewayId: gatewayId,
                    shipmentId: 0, //temporary
                    messageToken: "messageToken",
                    applyToAll: false,
                    tagList: eventdetails.requestBody.tagList
                },
            },
        })
            .then(function (reason) {
                Logging.msg("Result Pass: " + reason);
                response = {
                    status: "Pass",
                    details: reason
                };
            })
            .catch(function (reason) {
                Logging.msg("Result Error: " + reason);
                response = {
                    status: "Fail",
                    details: reason
                };
            })
        return response;
    }

    /**
       Airplane mode enable GW endpoint --
       Generates airplane mode enable JSON messages to sent as C2D message via IOT HUB
     */
    async function airplane_mode_gateway_event_handler(eventdetails) {
        Logging.msg("airplane mode: " + Northsouth.southbound.msgids.airplaneMode);
        Logging.msg("eventdetails: " + JSON.stringify(eventdetails));
        const gatewayId = eventdetails.gatewayId;
        const shipmentId = eventdetails.requestBody.shipmentId;
        const apmDuration = eventdetails.requestBody.apmDuration;
        var response = {};
        var body = {
            properties: {
                northsouth_msgid: Northsouth.southbound.msgids.airplaneMode,
            },
            data: {
                msgType: Northsouth.southbound.msgids.airplaneMode,
                JSON: {
                    time: Date.now(),
                    gatewayId: gatewayId,
                    shipmentId: 0, //temporary
                    messageToken: "messageToken",
                    applyToAll: true,
                    tagList: [],
                    airplaneMode: true,
                },
            },
        };
        if (eventdetails.requestBody.reason == 'geofence') {
            body.data.JSON.reason = 'geofence';
            body.data.JSON.duration = eventdetails.requestBody.apmDuration;
        } else {
            body.data.JSON.reason = 'normal';
            body.data.JSON.duration = eventdetails.time;
        }
        Logging.msg("body: " + JSON.stringify(body));
        var result = await GwComms.sendGwMsg(
            sendoptions,
            gatewayId,
            body
        )
            .then(function (reason) {
                Logging.msg("Result Pass: " + reason);
                response = {
                    status: "Pass",
                    details: reason
                };
            })
            .catch(function (reason) {
                Logging.msg("Result Error: " + reason);
                response = {
                    status: "Fail",
                    details: reason
                };
            })
        return response;
    }

    /**
       Channel Change GW endpoint --
       Generates channel change JSON messages to sent as C2D message via IOT HUB
     */
    async function channel_change_gateway_event_handler(eventdetails) {
        Logging.msg("Change Channel: " + Northsouth.southbound.msgids.channelChangeGateway);
        const gatewayId = eventdetails.gatewayId;
        const newChannel = eventdetails.newChannel;
        var response = {};
        Logging.msg("gateway ID: " + gatewayId);
        Logging.msg("new channel: " + newChannel);

        await GwComms.sendGwMsg(
            sendoptions,
            gatewayId, {
            properties: {
                northsouth_msgid: Northsouth.southbound.msgids.channelChangeGateway,
            },
            data: {
                msgType: Northsouth.southbound.msgids.channelChangeGateway,
                JSON: {
                    time: Date.now(),
                    gatewayId: gatewayId,
                    shipmentId: 0, //temporary
                    messageToken: "messageToken",
                    channelId: newChannel
                },
            },
        })
            .then(function (reason) {
                Logging.msg("Result Pass: " + reason);
                response = {
                    status: "Pass",
                    details: reason
                };
            })
            .catch(function (reason) {
                Logging.msg("Result Error: " + reason);
                response = {
                    status: "Fail",
                    details: reason
                };
            })
        return response;
    }

    /**
       configchange - happens in monitoring phase -

       generates : "2.1 Change multiple configuration" C2D message
       to the gateway.
    */
    async function configchange_event_handler(eventdetails) {
        await Dal.gather_config_change_data(eventdetails.shipmentId, eventdetails.requestBody, async function (err, msglist) {
            if (err) {
                Logging.msg("Error receiving Config Change Message from DAL: ", err);
                return;
            }

            /* Get Shipment Data by Shipment SQL Primary Key*/
            const shipment = await shipDal.findByPrimaryKey(eventdetails.shipmentId);
            Logging.msg("Shipment Data : " + JSON.stringify(shipment));

            const tagsInShipment = [];
            shipment.gateways.forEach(gateway => {
                gateway.shippingUnits.forEach(shippingUnit => {
                    shippingUnit.tags.forEach(tag => {
                        tagsInShipment.push(tag.uuid);
                    });
                });
            });
            Logging.msg("tagsInShipment: " + JSON.stringify(tagsInShipment));

            let gatewaysList = {};
            for (let tagId of tagsInShipment) {
                let lastRecord = await sensorDataDal.getLastAddTagResponaseRecordByTagId(tagId);
                if (!lastRecord) continue;
                if (!gatewaysList[lastRecord.gatewayId])
                    gatewaysList[lastRecord.gatewayId] = [];
                gatewaysList[lastRecord.gatewayId].push(tagId);
            };
            Logging.msg("gatewaysList: " + JSON.stringify(gatewaysList));

            for (let gatewayId in gatewaysList) {
                Logging.msg('gatewayId: ' + gatewayId);

                Logging.msg("configuration change data dump: ", JSON.stringify(msglist[0]));
                Logging.msg("sending: " + Northsouth.southbound.msgids.configchange +
                    " to " + gatewayId);
                await GwComms.sendGwMsg(
                    sendoptions,
                    gatewayId, {
                    properties: {
                        northsouth_msgid: Northsouth.southbound.msgids.configchange,
                        msgType: Northsouth.southbound.msgids.configchange
                    },
                    data: msglist[0]
                })
                    .then(function (reason) {
                        Logging.msg("ConfigChange: " + reason)
                    })
                    .catch(function (reason) {
                        Logging.msg("Catch ConfigChange: " + reason)
                    })
            }
        });

        //Temporarly reply with PASS, until the sync code is implemented
        var response = {
            status: "Pass",
            details: null
        };
        return response;
    }
    /**
       disassociate - happens when desk agent shuts down the shipment
       ...usually at the end -- but this code doesn't care exactly
       when.

       generates : "2.4 Disassociation request"
    */
    function disassociate_event_handler(eventdetails) {
        function gather() {
            Dal.gather_disassociation_data(eventdetails.shipmentId, function (err, msglist) {
                if (err) {
                    Logging.msg("error with gathering disassociation data: " + err);
                    return;
                }
                Logging.msg("disassociation data dump: ", msglist);
                //loop sending to each entry in the msgList array
                for (var entry in msglist) {
                    Logging.msg("sending: " + Northsouth.southbound.msgids.disassociation);
                    GwComms.sendGwMsg(
                        sendoptions,
                        msglist[entry].gatewayId, {
                        properties: {
                            northsouth_msgid: Northsouth.southbound.msgids.disassociation,
                        },
                        data: {
                            msgType: Northsouth.southbound.msgids.disassociation,
                            JSON: msglist[entry],
                        }
                    });
                }
            });
        }

        /*
          put this on node event loop - so other stuff can run
          and we can return to REST caller right away
        */
        //setImmediate(gather);
        //Temporarly reply with PASS, until the sync code is implemented
        var response = {
            status: "Pass",
            details: null
        };
        return response;
    }

    /**
       startReceving - For non-OBT flow, sends msg to CO apk
       on the gateway to start the receving process and
       disassociate the shipment
    */
    async function startReceving_event_handler(eventdetails) {
        Logging.msg("startReceving_event_handler: " + Northsouth.southbound.msgids.startReceving);

        const gatewayId = eventdetails.requestBody.gatewayId;
        const shipmentId = eventdetails.shipmentId;
        Logging.msg("gateway ID: " + gatewayId + ", shipmentId: " + shipmentId);
        var response = {};

        await GwComms.sendGwMsg(
            sendoptions,
            gatewayId, {
            properties: {
                northsouth_msgid: Northsouth.southbound.msgids.startReceving,
            },
            data: {
                msgType: Northsouth.southbound.msgids.startReceving,
                JSON: {
                    time: Date.now(),
                    gatewayId: gatewayId,
                    shipmentId: shipmentId,
                },
            },
        })
            .then(function (reason) {
                Logging.msg("Result Pass: " + reason);
                response = {
                    status: "Pass",
                    details: reason
                };
            })
            .catch(function (reason) {
                Logging.msg("Result Error: " + reason);
                response = {
                    status: "Fail",
                    details: reason
                };
            });
        return response;
    }

    /**
       Not found handler http request hanlder
       see: https://expressjs.com/en/starter/faq.html
    */
    function notfound_handler(req, res) {
        Logging.msg("+notfound_handler: " + req.originalUrl);
        res.status(404).send({
            msg: Errorlist.notfounderror.msg,
            code: Errorlist.notfounderror.code
        });
    }

    /**
       Error handling funtion for errors that are thrown
       in the context of handling and http request

       see https://expressjs.com/en/guide/error-handling.html
    */
    function error_handler(err, req, res, next) {
        Logging.msg("+error_handler: " + req.originalUrl);
        Logging.msg("err dump: ", err);

        res.status(500).send({
            msg: Errorlist.unknownreqerror.msg,
            code: Errorlist.unknownreqerror.code
        });
    }

    /* instantiate express object */
    const expressapp = express();

    /* enable automatic parsing of json request bodies
       this is what causes the req.body to be populated.

       see: https://expressjs.com/en/4x/api.html#express.json  */
    expressapp.use(express.json());

    /* enable extended url encoding on request line
       -- uses the qs library under the hood.
       see : https://expressjs.com/en/4x/api.html#express.urlencoded
       see : https://www.npmjs.com/package/qs#readme  */
    expressapp.use(express.urlencoded({
        extended: true
    }));

    /* define our event endpoint
       see : https://expressjs.com/en/4x/api.html#app.post.method */
    expressapp.post("/event/:id", event_endpoint);

    /* define a default, non-error handler for anything not handled
       by routes above -- i.e. custom 404 handler

       see : How do I handle 404 responses topic here: https://expressjs.com/en/starter/faq.html */
    expressapp.use(notfound_handler);

    /* define a catch all error handler for when bad things happen during request hanlding
       i.e. internal server error.
       this ends up being called on javascript errors, exceptions thrown etc

       see : https://expressjs.com/en/guide/error-handling.html */
    expressapp.use(error_handler);

    /* finally, listen for inbound requests on port 3000

       see: https://expressjs.com/en/4x/api.html#app.listen  */
    expressapp.listen(3000);

    Logging.msg("listening on http://localhost:3000");

}
