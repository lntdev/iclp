const Logging   = require('cccommon/logging').logger('keystore.route.admin');
Logging.enable();

exports.getRoutes = () => {
  const constant = require('cccommon/constant');
  const tokenAuth = require('this_pkg/auth/token');
  const roleAuth = require('this_pkg/auth/role');
  const basePath = '/admin';
  const routes = [{
      method: 'put',
      path: basePath +'/device',
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./get/device')
    },
    {
      method: 'post',
      path: basePath + '/device/update',
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./post/update')
    },
    {
      method: 'delete',
      path: basePath + '/',
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./delete/one')
    },
    {
      method: 'delete',
      path: basePath + '/all,
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./delete/all')
    }
  ];
  return routes;
}
