const Logging = require('cccommon/logging').logger('shippingapi.route.shipments');
Logging.enable();

exports.getRoutes = () => {
  const constant = require('cccommon/constant');
  const statusConst = constant.status;
  const roleConst = constant.role;
  const tokenAuth = require('this_pkg/auth/token');
  const roleAuth = require('this_pkg/auth/role');
  const basePath = '/shipments';
  const get = require('./get');
  const shipmentDi = require('this_pkg/shipment/di');
  const validateStatusTransition = require('this_pkg/shipment/status').validateTransition;
  const validateStatusLockOwner = require('this_pkg/shipment/statusLock').validateOwner;
  const exposeDeveloperEndpoints = require('cccommon/config').shippingapi.exposeDeveloperEndpoints();
  const securityEnable = require('cccommon/config').security.enable();
  const routes = [
    /**
     * CREATE
     */

    {
      method: 'post',
      path: basePath,
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent()
        ]
      ),
      handler: require('./post').handler
    },

    /**
     * RETRIEVE / FETCH / QUERY
     */

    {
      method: 'get',
      path: basePath,
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      handler: get.list
    },
    {
      method: 'get',
      path: basePath + '/:id',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [ // first wrapper listed is first to wrap the handler
        shipmentDi
      ],
      handler: get.one
    },
    {
      method: 'put',
      path: basePath + '/:id/location',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [],// first wrapper listed is first to wrap the handler
      handler: require('./put/location')
    },
    {
      method: 'put',
      path: basePath + '/:id/monitor',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [ // first wrapper listed is first to wrap the handler
        validateStatusTransition([
          {
            from: statusConst.new(),
            to: statusConst.inMonitoring()
          }
        ]),
        shipmentDi
      ],
      handler: require('./put/monitor')
    },
    {
      method: 'put',
      path: basePath + '/:id/monitor/config',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent()
        ]
      ),
      customWrappers: [ // first wrapper listed is first to wrap the handler
        validateStatusLockOwner,
        shipmentDi
      ],
      handler: require('./put/monitor/config')
    },
    {
      method: 'put',
      path: basePath + '/:id/end',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent()
        ]
      ),
      customWrappers: [ // first wrapper listed is first to wrap the handler
        validateStatusTransition([
          { from: statusConst.inMonitoring(), to: statusConst.completedDeinstrumented() }
        ]),
        shipmentDi
      ],
      handler: require('./put/end')
    },
    {
      method: 'post',
      path: basePath + '/:id/calibrate',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent()
        ]
      ),
      customWrappers: [ // first wrapper listed is first to wrap the handler
        shipmentDi
      ],
      handler: require('./post/calibrate')
    }
  ];

  if (exposeDeveloperEndpoints === true) {
    Logging.msg('deletion endpoints enabled');

    routes.push({
      method: 'delete',
      path: basePath + '/:id',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [ // first wrapper listed is first to wrap the handler
        shipmentDi
      ],
      handler: require('./delete/one')
    });

    routes.push({
      method: 'delete',
      path: basePath,
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      handler: require('./delete/all')
    });
  }

  if (securityEnable) {
    /**
     * AUTHENTICATE
     */
    Logging.msg("Security is enabled");
    routes.push({
      method: 'post',
      path: basePath + '/authenticate/:id',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [
        shipmentDi
      ],
      handler: require('./post/authenticate').handler
    });
  } else Logging.msg("Security is disabled");

  return routes;
};
