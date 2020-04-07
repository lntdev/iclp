const Logging   = require('cccommon/logging').logger('keystore.route.device');
Logging.enable();

exports.getRoutes = () => {
  const constant = require('cccommon/constant');
  const tokenAuth = require('this_pkg/auth/token');
  const roleAuth = require('this_pkg/auth/role');
  const basePath = '/device';
  const routes = [{
      method: 'get',
      path: basePath +'/challenge/:uuid',
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./get/challenge')
    },
    {
      method: 'get',
      path: basePath + '/credentials/:uuid',
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./get/credentials') 
    }
  ];
  return routes;
}
