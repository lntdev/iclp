const Logging = require('cccommon/logging').logger('shippingapi.route.sensordata');
Logging.enable();

exports.getRoutes = () => {
  const constant = require('cccommon/constant');
  const statusConst = constant.status;
  const roleConst = constant.role;
  const tokenAuth = require('this_pkg/auth/token');
  const roleAuth = require('this_pkg/auth/role');
  const basePath = '/sensordata';
  const get = require('./get');
  const del = require('./delete');
  const getTag = require('./get/tag');
  const getGateway = require('./get/gateway');
  const getPackage = require('./get/package');
  const shipmentDi = require('this_pkg/shipment/di');
  const exposeDeveloperEndpoints = require('cccommon/config').shippingapi.exposeDeveloperEndpoints();

  const routes = [
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
      customWrappers: [],
      handler: get.list
    },
    {
      method: 'get',
      path: basePath + '/:shipmentId/tag/:tagId',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [],
      handler: getTag.list
    },
    {
      method: 'get',
      path: basePath + '/:shipmentId/tag/:tagId/alerts',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [],
      handler: getTag.list
    },
    {
      method: 'get',
      path: basePath + '/:shipmentId/package/:packageId',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [],
      handler: getPackage.list
    },
    {
      method: 'get',
      path: basePath + '/:shipmentId/package/:packageId/alerts',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [],
      handler: getPackage.list
    },
    {
      method: 'delete',
      path: basePath + '/delete/:id',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [],
      handler: del.all
    },
    {
      method: 'get',
      path: basePath + '/gateway/:gatewayId',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers: [],
      handler: getGateway.list
    }
  ];
  return routes;
}
