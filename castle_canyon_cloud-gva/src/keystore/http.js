const express = require('express');
const morgan = require('morgan');
const through2 = require('through2');
const cors = require('cors');
const addRequestId = require('express-request-id')();
const https = require('https');
const fs = require('fs');

const Commonconfig  = require('cccommon/config');
const Logging = require('cccommon/logging').logger('keystore');Logging.enable();
const appErr = require('./error');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

/**
 * Add routes from their individual modules.
 *
 * Each module implmements an 'interface' whose main method is addRouteTo(app) which
 * delegates actual calls like app.post() to the module itself where that knowledge
 * should be contained.
 *
 * The interface also exposes methods like post(req.res) -- if applicable to the route --
 * but only to support direct/granular access by tests.
 */
exports.addRoutes = (app) => {
  let routeDefs = [];

  // All route modules return an array of route definitions (POJOs with
  // method/path/handler fields) that are simply added to a master list, routeDefs.
  routeDefs = routeDefs.concat(require('./route/keystore').getRoutes());
  routeDefs = routeDefs.concat(require('./route/device').getRoutes());
  // Perform basic validation of the route definition objects and actually add them to
  // the express app.
  routeDefs.forEach(def => {
    const defJSON = JSON.stringify(def, null, 2);
    if (!def.method) {
      throw new Error(`route definition is missing the method:\n${defJSON}`);
    }
    if (!def.path) {
      throw new Error(`route definition is missing the path:\n${defJSON}`);
    }
    if (!def.handler) {
      throw new Error(`route definition is missing the handler:\n${defJSON}`);
    }
    if (!def.tokenAuthWrapper) {
      throw new Error(`route definition is missing the tokenAuthWrapper:\n${defJSON}`);
    }
    if (!def.roleAuthWrapper) {
      throw new Error(`route definition is missing the roleAuthWrapper:\n${defJSON}`);
    }

    if (def.handler.init) {
      def.handler.init();
    }

    /*
     * Finalize the handler by wrapping it with additional functions as needed.
     */
    let finalHandler = def.handler;

    if (Array.isArray(def.customWrappers)) {
      def.customWrappers.forEach(wrapper => {
        finalHandler = wrapper(finalHandler);
      });
    }

    finalHandler = def.roleAuthWrapper(finalHandler);
    finalHandler = def.tokenAuthWrapper(finalHandler);

    // MUST BE LAST so that all layers are "inside" the try/catch.
    finalHandler = exports.wrapHandlerTryCatch(finalHandler);

    app[def.method](def.path, finalHandler);
    //Swagger Stuff
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api/v1', finalHandler);
  });
};

/**
 * Common wrapped applied to all endpoint handler functions during exports.addRoutes.
 *
 * Its main purpose is to catch exceptions with central logic in order to reduce per-handler boilerplate.
 */
exports.wrapHandlerTryCatch = (handler) => {
  return (async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      appErr.handleRouteServerErr(req, res, err, Logging, 'failed to process request');
    }
  });
};

/**
 * Read from central config.
 *
 * Thin wrapper to support reuse in tests so they don't need to know the
 * actual location, only the structure of the object returned.
 *
 * @return {object}
 * - {string} port
 */
exports.getConfig = () => {
  return Commonconfig.keystore.http();
}

/**
 * Assign settings, middleware, routes, misc handlers, etc.
 *
 * Separate from exports.run to support reuse in tests.
 *
 * @param {app} Express app.
 */
exports.configureApp = (app, httpConfig) => {
  // Set these as soon as possible because they may impact values used in middleware.
  app.set('etag', false); // Disable because we're not currently maintaining any cache hint logic.
  app.set('x-powered-by', false); // No use case
  app.set('case sensitive routing', true); // Speak up about typos

  app.use(addRequestId);

  morgan.token('id', (req) => {
    return req.id;
  });
  const morganOpts = {
    stream: through2((output, enc, callback) => {
      Logging.msg(output.toString('utf8').trim());
      callback();
    })
  };
  app.use(morgan('[:date[clf]] ":method :url" :status :id :res[content-length] ":referrer" ":user-agent" :response-time ms :remote-addr - :remote-user', morganOpts));

  exports.configureCors(app, httpConfig);

  app.use(express.json(httpConfig.json()));
  app.use(exports.jsonParseErrHandler);

  app.use(express.urlencoded({extended: true}));


  app.use(exports.createReqLogger(httpConfig));

  exports.addRoutes(app);

  app.use(exports.notFoundHandler);
  app.use(exports.errorHandler);
};

/**
 * Apply default/custom CORS configuration.
 */
exports.configureCors = (app, httpConfig) => {
  // Wildcard may be the only practical value since we don't know where the UI(s) will be hosted.
  // But we'll allow configuration of it at deploy time.
  let origin = '*';

  if (httpConfig && httpConfig.cors) {
    if (httpConfig.cors.origin) {
      origin = [];
      httpConfig.cors.origin.split(',').forEach(pattern => {
        if (pattern) {
          origin.push(pattern);
        }
      });
    }
  }

  app.use(cors({
    origin: origin,

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ],

    // Based on what cors does, use 200 (instead of 204) to support browsers like IE11.
    optionsSuccessStatus: 200
  }));
};

exports.createReqLogger = (httpConfig) => {
  return (req, res, next) => {
    if (!httpConfig.requestLog.enabled) {
      next();
      return;
    }

    const details = {
      protocol: req.protocol,
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      ip: req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null)
    };

    if (httpConfig.requestLog.scope.body) {
      details.body = Object.assign({}, req.body);
    }
    if (httpConfig.requestLog.scope.headers) {
      details.headers = Object.assign({}, req.headers);
    }
    if (httpConfig.requestLog.scope.query) {
      details.query = Object.assign({}, req.query);
    }

    Logging.msg('requestLog', appErr.addRequestIdToObj(req, details));
    next();
  };
};

exports.jsonParseErrHandler = (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  const details = {};

  if (err.message) {
    details.error = err.message;

    if (err.message === 'request entity too large') {
      const limit = exports.getConfig().json().limit;
      if (limit) {
        details.limit = limit;
      }
    }
  }

  appErr.send(req, res, 'bad_request', 'Request JSON could not be parsed', details);
};

exports.notFoundHandler = (req, res) => {
  Logging.msg('invalid route requested', appErr.addRequestIdToObj(req, {}));
  appErr.send(req, res, 'not_found');
};

exports.errorHandler = (err, req, res) => {
  const attrs = {
    // Avoid circular from libs that augment error objects
    err: {
      code: err.code,
      message: err.message,
      stack: err.stack
    }
  };
  Logging.msg('unhandled error', appErr.addRequestIdToObj(req, attrs));
  appErr.send(req, res, 'server_error');
};

exports.run = () => {
  const httpConfig = exports.getConfig();
  const app = express();

  exports.configureApp(app, httpConfig);

  if (Commonconfig.https.enable() == "disable") {
    app.listen(httpConfig.port);
    Logging.msg(`listening on http://localhost:${httpConfig.port}`);
  } else {
    var privateKey  = fs.readFileSync(Commonconfig.https.key_file(), 'utf8');
    var certificate = fs.readFileSync(Commonconfig.https.crt_file(), 'utf8');
    var certificateAuthority = [fs.readFileSync(Commonconfig.https.ca_bundle_file())];
    var sslOptions = {
      key: privateKey,
      cert: certificate,
      ca: certificateAuthority,
      requestCert: true,
      rejectUnauthorized: false
    };
    var httpsServer = https.createServer(sslOptions, app);
    httpsServer.listen(httpConfig.port);
    Logging.msg(`listening on https://localhost:${httpConfig.port}`);
  }
};
