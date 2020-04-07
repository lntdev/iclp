const Logging   = require('cccommon/logging').logger('keystore.route.keystore');
Logging.enable();

exports.getRoutes = () => {
  const constant = require('cccommon/constant');
  const tokenAuth = require('this_pkg/auth/token');
  const roleAuth = require('this_pkg/auth/role');
  const basePath = '/keystore';
  const get = require('./get/authenticate');
  const post = require('./post');
  const reg = require('./post/register')
  const routes = [{
      method: 'get',
      path: basePath +'/authenticate/',
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: get.one
    },
    {
      method: 'post',
      path: basePath + '/',
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: post.handler  
    },
     {
      method: 'post',
      path: basePath + '/register/',
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: reg.handler
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
      path: basePath + '/all/',
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./delete/all')
    },
    {
      method: 'post',
      path: basePath + '/updateDeviceRecord/',
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./post/update')
    }
  ];
  return routes;
}
