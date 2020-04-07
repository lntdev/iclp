
const Logging = require('cccommon/logging').logger('common.client.gwmessenger');
Logging.enable();

const request = require('superagent');
const gwmConfig = require('cccommon/config').gwmessenger;

/**
 * Create a request pre-augmented with body fields that should be universal.
 */
exports.newReqBody = (req) => {
  return {
    requestId: req.id,
    requestBody: req.body
  };
};
/**
 * @param {int} gatewayID of gateway that needs to be rebooted.
 */
exports.rebootGateway = (originReq, gatewayId) => {
  return exports.sendGatewayIdEvent(originReq, gatewayId, 'rebootgateway');
};
/**
 * @param {int} gatewayID of gateway that needs to be informed about the remove tag.
 */
exports.removeTag = (originReq, gatewayId) => {
  return exports.sendGatewayIdEvent(originReq, gatewayId, 'removetag');
};
/**
 * @param {int} gatewayID of gateway that needs to be informed about the add tag.
 */
exports.addTagResponse = (originReq, gatewayId) => {
  return exports.sendGatewayIdEvent(originReq, gatewayId, 'addtagresponse');
};
/**
 * @param {int} gatewayID of gateway that needs to be put into airplane mode
 */
exports.airplaneMode = (originReq, gatewayId) => {
  return exports.sendGatewayIdEvent(originReq, gatewayId, 'airplanemode');
};
/**
 * @param {int} gatewayID of gateway that needs to sent the blobconnection string
 */
exports.uploadDiagnosticConfig = (originReq, gatewayId) => {
  return exports.sendGatewayIdEvent(originReq, gatewayId, 'uploadDiagnosticConfig');
};
/**
 * @param {int} gatewayID of gateway that needs to be calibrated.
 */
exports.calibrateGateway = (originReq, gatewayId) => {
  return exports.sendGatewayIdEvent(originReq, gatewayId, 'calibrategateway');
};
/**
 * @param {int} gatewayID of gateway that needs a channel change
 */
exports.channelChangeGateway = (originReq, gatewayId) => {
  return exports.sendGatewayIdEvent(originReq, gatewayId, 'channelchangegateway');
};
/**
 * @param {int} shipmentId DB primary key ('id'), not the 'shipmentId' DB column.
 */
exports.configChange = (originReq, shipmentId) => {
  return exports.sendShipmentIdEvent(originReq, shipmentId, 'configchange');
};

/**
 * @param {int} shipmentId DB primary key ('id'), not the 'shipmentId' DB column.
 */
exports.disassociate = (originReq, shipmentId) => {
  return exports.sendShipmentIdEvent(originReq, shipmentId, 'disassociate');
};

/**
 * @param {int} shipmentId DB primary key ('id'), not the 'shipmentId' DB column.
 */
exports.startReceving = (originReq, shipmentId) => {
  return exports.sendShipmentIdEvent(originReq, shipmentId, 'startReceving');
};
/**
 * Shared sender for all messages that only send 'shipmentId' to the event-specific endpoint.
 *
 * @param {int} shipmentId DB primary key ('id'), not the 'shipmentId' DB column.
 */
exports.sendShipmentIdEvent = async (originReq, shipmentId, eventId) => {
  const url = gwmConfig.url()[eventId]();
  const gwmReqBody = exports.newReqBody(originReq);
  let res;

  try {
    if (!originReq) {
      throw new Error(`failed to send ${eventId} event to gwmessenger, origin request object missing`);
    }
    if (!shipmentId) {
      throw new Error(`failed to send ${eventId} event to gwmessenger, shipment ID missing`);
    }

    // Send as string to pass input validation
    gwmReqBody.shipmentId = '' + shipmentId;

    res = await request.post(url).send(gwmReqBody).catch((err, res) => {
      Logging.msg("SuperAgent catch!! err: " + err + "; res: " + res);
      response = err;
      return response;
    });

    exports.logReqSuccess(eventId, originReq, res, Logging, url, gwmReqBody);
  } catch (err) {
    exports.logReqFailure(eventId, originReq, null, Logging, url, gwmReqBody, err);

    // Bubble up to caller. We just needed to catch in order to log this context's
    // details about what happened.
    throw err;
  }

  return res;
};

/**
 * Shared sender for all messages that only send 'gatewayId' to the event-specific endpoint.
 *
 * @param {int} gateway Id of device.
 */
exports.sendGatewayIdEvent = async (originReq, gatewayId, eventId) => {
  const url = gwmConfig.url()[eventId]();
  const gwmReqBody = exports.newReqBody(originReq);
  let response;

  try {
    if (!originReq) {
      throw new Error(`failed to send ${eventId} event to gwmessenger, origin request object missing`);
    }
    if (!gatewayId) {
      throw new Error(`failed to send ${eventId} event to gwmessenger, gateway ID missing`);
    }

    // Send as string to pass input validation
    gwmReqBody.gatewayId  = '' + gatewayId;
    if(eventId == 'channelchangegateway') {
      gwmReqBody.newChannel = '' + originReq.params.newchannel;
    }
    if(eventId == 'airplanemode') {
      gwmReqBody.time = '' + originReq.params.time;
    }
    if (eventId == 'uploadDiagnosticConfig') {
      gwmReqBody.connStr = '' + originReq.body.diagnosticBlobConnectionString;
    }

    response = await request.post(url).send(gwmReqBody).catch((err, res) => {
      Logging.msg("SuperAgent catch!! err: " + err + "; res: " + res);
      response = err;
      return response;
    });

    exports.logReqSuccess(eventId, originReq, response, Logging, url, gwmReqBody);
  } catch (err) {
    exports.logReqFailure(eventId, originReq, null, Logging, url, gwmReqBody, err);
    Logging.msg("Caught Error, res: " + response);
    // Bubble up to caller. We just needed to catch in order to log this context's
    // details about what happened.
    return response;
  }
  Logging.msg("res: " + JSON.stringify(response));
  return response;
};

exports.logReq = (eventId, result, originReq, gwmRes, logger, gwmUrl, gwmReqBody, err) => {
  const details = {
    eventId: eventId,
    result: result,
    requestId: originReq.id,
    gwmUrl: gwmUrl,
    gwmReqBody: gwmReqBody
  };

  if (err) {
    details.err = {
      stack: err.stack,
      message: err.message,
      code: err.code
    };
    if (err.status) {
      details.gwmErrResStatusCode = err.status;
    }
    if (err.response) {
      if (err.response.body) {
        details.gwmErrResBody = err.response.body;
      }
    }
  }

  if (gwmRes) {
    if (gwmRes.status) {
      details.gwmStatusCode = gwmRes.status;
    }
    if (gwmRes.body) {
      details.gwmResBody = gwmRes.body;
    }
  }

  logger.msg(`shippingapi request to gwmessenger: ${result}`, details);
};

exports.logReqSuccess = (eventId, originReq, gwmRes, logger, gwmUrl, gwmReqBody) => {
  exports.logReq(eventId, 'success', originReq, gwmRes, logger, gwmUrl, gwmReqBody, null);
};

exports.logReqFailure = (eventId, originReq, gwmRes, logger, gwmUrl, gwmReqBody, err) => {
  exports.logReq(eventId, 'failure', originReq, gwmRes, logger, gwmUrl, gwmReqBody, err);
};
