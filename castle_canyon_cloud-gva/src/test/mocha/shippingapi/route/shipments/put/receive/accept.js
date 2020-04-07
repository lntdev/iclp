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
  return `${routePath}/${id}/receive/accept`;
}

describe('transition shipment to accepted', function() {
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
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());

    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    res = await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    helper.expect.resStatus(res, successStatus);

    res = await helper.shipment.receive(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: verify update
     */
    res = await helper.shipment.getById(app, token, id);
    helper.shipment.expectStatusAndLocked(res, statusConst.inReceiving(), roleConst.name.dockWorker());

    /**
     * STEP: attempt update (with a different dock worker)
     */
    token = await helper.login(app, roleConst.name.dockWorker() + '-two');
    res = await helper.shipment.receive.accept(app, token, id);
    helper.shipment.expectForbiddenStatusTrans(res, roleConst.name.dockWorker());

    /**
     * STEP: verify no update
     */
    res = await helper.shipment.getById(app, token, id);
    expect(res.body.status).to.be.equalAndDefined(statusConst.inReceiving());
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
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());

    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    res = await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    helper.expect.resStatus(res, successStatus);

    res = await helper.shipment.receive(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update
     */
    res = await helper.shipment.receive.accept(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: verify update
     */
    res = await helper.shipment.getById(app, token, id);
    helper.shipment.expectStatusAndUnlocked(res, statusConst.accepted());

    /**
     * STEP: verify redundant change is allowed
     */
    res = await helper.shipment.receive.accept(app, token, id);
    helper.expect.resStatus(res, successStatus);
  });
});

