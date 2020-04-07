const expect = T.expect;
const roleConst = require('cccommon/constant').role;
const helper = T.helper.shippingapi;

describe('post session', function() {
  it('should return token for deskagent', async function() {
    await helper.login(helper.getApp(), roleConst.name.deskAgent());
  });

  it('should return token for dockworker', async function() {
    await helper.login(helper.getApp(), roleConst.name.dockWorker());
  });

  it('should return token for admin', async function() {
    await helper.login(helper.getApp(), 'admin');
  });
});
