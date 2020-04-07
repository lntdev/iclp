exports.getRoutes = () => {
  const tokenAuth = require('this_pkg/auth/token');
  const roleAuth = require('this_pkg/auth/role');
  const path = '/session';
  return [
    {
      method: 'post',
      path: path,
      tokenAuthWrapper: tokenAuth.DISABLED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./post').handler
    },
    {
      method: 'get',
      path: path,
      tokenAuthWrapper: tokenAuth.REQUIRED,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./get').handler
    },
    {
      method: 'delete',
      path: path,
      tokenAuthWrapper: tokenAuth.OPTIONAL,
      roleAuthWrapper: roleAuth.DISABLED,
      handler: require('./delete').handler
    }
  ];
};
