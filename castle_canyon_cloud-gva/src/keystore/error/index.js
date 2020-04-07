const Logging = require('cccommon/logging').logger('shippingapi.error');
Logging.enable();

exports.send = (req, res, appCode, ...tableArgs) => {
  let errSpec = table[appCode];

  if (errSpec === undefined) {
    Logging.msg(`route handler tried to use an invalid app error code: [${appCode}]`);

    errSpec = table.server_error.errConstructor(500);
    errSpec.code = errSpec.appCode;

    res.status(errSpec.status).send(exports.addRequestIdToObj(req, errSpec));
  } else {
    let errObj = errSpec.errConstructor(...tableArgs);
    errObj.code = appCode;

    errObj = exports.addRequestIdToObj(req, errObj);
    Logging.msg('shippingapi error response', errObj);

    res.status(errObj.status).send(errObj);
  }
};

exports.addRequestIdToObj = (req, obj) => {
  obj.requestId = req.id;
  return obj;
};

exports.mergeValErrList = (valErrs) => {
  let out = {};
  for (let v of valErrs) {
    out = Object.assign({}, out, v);
  }
  return out;
};

exports.newError = newError;

exports.handleRouteServerErr = (req, res, err, logger, msgStr) => {
  if (err) {
    // Avoid circular from libs that augment error objects
    err = {
      code: err.code,
      message: err.message,
      stack: err.stack
    };
  }
  logger.msg(msgStr, exports.addRequestIdToObj(req, {
    err: err
  }));
  exports.send(req, res, 'server_error');
};

function newError(status, message, details) {
  return {status: status, message: message, details: Object.assign({}, details || {})};
}

const table = {};
function addToTable(appErrCode, errConstructor) {
  if (table[appErrCode]) {
    throw new Error(`application error code [${appErrCode}] already defined`);
  }
  table[appErrCode] = {
    appErrCode: appErrCode,
    errConstructor: errConstructor
  };
}

addToTable('bad_request', (message, details) => {
  return newError(400, message, details);
});

addToTable('unauthorized', () => {
  return newError(401, 'Unauthorized');
});

addToTable('forbidden', (message, details) => {
  return newError(403, message, details);
});

addToTable('not_found', () => {
  return newError(404, 'Not Found');
});

addToTable('status_conflict', (message, details) => {
  return newError(409, message, details);
});

addToTable('server_error', (status, message, details) => {
  if (status === undefined) {
    status = 500;
  }
  if (message === undefined) {
    message = 'The server failed to process the request. Please include the requestId when reporting the issue.';
  }
  return newError(status, message, details);
});

addToTable('input_validation_failed', (details) => {
  return newError(400, 'One or more input fields was not accepted.', details);
});

addToTable('status_transition_forbidden', (message, details) => {
  return newError(403, message, details);
});

addToTable('status_transition_invalid', (message, details) => {
  return newError(409, message, details);
});

addToTable('other', (message, details) => {
  return newError(410, message, details);
});
