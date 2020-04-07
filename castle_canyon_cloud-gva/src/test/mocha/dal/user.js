/* eslint-disable no-console */

const expect = T.expect;
const userDal = T.dal.user;
const helper = T.helper.shippingapi;
const roleConst = require('cccommon/constant').role;

describe('user dal', function() {
  async function findByToken(token) {
    return await userDal.findByToken(token);
  }

  describe('#findByToken()', function() {
    it('should find by token', async function() {
      const app = helper.getApp();

      let token = await helper.login(app, roleConst.name.dockWorker());
      let user = await findByToken(token);
      expect(user.roles).to.have.lengthOf(1);
      expect(user.roles[0].name).to.be.equalAndDefined(roleConst.name.dockWorker());
      expect(user.get('id')).to.be.above(0);

      token = await helper.login(app, roleConst.name.dockWorker() + '-two');
      user = await findByToken(token);
      expect(user.roles).to.have.lengthOf(1);
      expect(user.roles[0].name).to.be.equalAndDefined(roleConst.name.dockWorker());
      expect(user.get('id')).to.be.above(0);
    });
  });
});
