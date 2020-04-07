const Logging   = require('cccommon/logging').logger('shippingapi.route.gateway');
Logging.enable();

exports.getRoutes = () => {
  const constant = require('cccommon/constant');
  const statusConst = constant.status;
  const roleConst = constant.role;
  const tokenAuth = require('this_pkg/auth/token');
  const roleAuth = require('this_pkg/auth/role');
  const basePath = '/gateway';
  const exposeDeveloperEndpoints = require('cccommon/config').shippingapi.exposeDeveloperEndpoints();
  const routes = [
    {
      method: 'post',
      path: basePath +'/:id/reboot/sms',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
        ]
      ),
      customWrappers:[],
      handler: require('./post/reboot/sms').handler
    },
    {
      method: 'post',
      path: basePath +'/:id/uploadDiagnostic',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
        ]
      ),
      customWrappers:[],
      handler: require('./post/uploadDiagnostic').handler
    },
    {
      method: 'post',
      path: basePath +'/:id/reboot/mqtt',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
        ]
      ),
      customWrappers:[],
      handler: require('./post/reboot/mqtt').handler
    },
    {
      method: 'post',
      path: basePath +'/:id/calibrate',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
        ]
      ),
      customWrappers:[],
      handler: require('./post/calibrate').handler
    },
    {
      method: 'post',
      path: basePath +'/:id/channelchange/:newchannel',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
        ]
      ),
      customWrappers:[],
      handler: require('./post/channelchange').handler
    },
    {
      method: 'post',
      path: basePath +'/:id/airplanemode/:time',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
        ]
      ),
      customWrappers:[],
      handler: require('./post/airplanemode').handler
    },
    {
      method: 'get',
      path: basePath +'/:id/credentials',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers:[],
      handler: require('./get/credentials').handler
    },
    {
      method: 'put',
      path: basePath +'/provision',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers:[],
      handler: require('./put/provision').handler
    },
    {
      method: 'get',
      path: basePath +'/:id',
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.REQUIRED(
        [
          roleConst.name.deskAgent(),
          roleConst.name.dockWorker()
        ]
      ),
      customWrappers:[],
      handler: require('./get')
    }
  ];
  return routes;
}
