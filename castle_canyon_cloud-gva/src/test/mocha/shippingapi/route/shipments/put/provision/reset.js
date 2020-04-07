/* eslint-disable no-console */

const expect = T.expect;

const constant = require('cccommon/constant');
const roleConst = constant.role;
const statusConst = constant.status;
const helper = T.helper.shippingapi;
const method = 'put';
const routePath = '/shipments';
const fakeId = 50000;

function getRoutePath(id) {
  return `${routePath}/${id}/provision/reset`;
}

describe('transition shipment from inProvision back to new', function() {
  it('should require token auth', async function() {
    await helper.expect.notAuthorized(helper.getApp(), 'invalid token', method, getRoutePath(fakeId));
  });

  it('should require role auth', async function() {
    const app = helper.getApp();
    const token = await helper.login(app, roleConst.name.deskAgent());
    const res = await helper.expect.forbidden(app, token, method, getRoutePath(fakeId));
    helper.shipment.expectForbiddenRole(res, roleConst.name.dockWorker(), roleConst.name.deskAgent());
  });

  it('should require status lock owner', async function() {
    const app = helper.getApp();
    const successStatus = 204;
    let res;
    let token;

    /**
     * STEP: create a shipment as a desk agent
     */
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    token = created.token;
    const id = created.res.body.id;

    /**
     * STEP: begin provision
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: verify update
     */
    res = await helper.shipment.getById(app, token, id);
    helper.shipment.expectStatusAndLocked(res, statusConst.inProvision(), roleConst.name.dockWorker());

    /**
     * STEP: reset provision (with a different dock worker)
     */
    token = await helper.login(app, roleConst.name.dockWorker() + '-two');
    res = await helper.shipment.provision.reset(app, token, id);
    helper.shipment.expectForbiddenStatusTrans(res, roleConst.name.dockWorker());

    /**
     * STEP: verify no update
     */
    res = await helper.shipment.getById(app, token, id);
    expect(res.body.status).to.be.equalAndDefined(statusConst.inProvision());
  });

  it('should update shipment', async function() {
    const app = helper.getApp();
    const successStatus = 204;
    let res;
    let token;

    /**
     * STEP: create a shipment as a desk agent
     */
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    token = created.token;
    const id = created.res.body.id;

    /**
     * STEP: begin provision
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: verify update
     */
    res = await helper.shipment.getById(app, token, id);
    helper.shipment.expectStatusAndLocked(res, statusConst.inProvision(), roleConst.name.dockWorker());

    /**
     * STEP: reset provision
     */
    res = await helper.shipment.provision.reset(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: verify update
     */
    res = await helper.shipment.getById(app, token, id);
    helper.shipment.expectStatusAndUnlocked(res, statusConst.new());

    /**
     * STEP: verify redundant change is allowed
     */
    res = await helper.shipment.provision.reset(app, token, id);
    helper.expect.resStatus(res, successStatus);
  });
});

