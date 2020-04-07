/* eslint-disable no-console */

const constant = require('cccommon/constant');
const roleConst = constant.role;
const statusConst = constant.status;
const helper = T.helper.shippingapi;
const method = 'put';
const routePath = '/shipments';
const fakeId = 50000;

function getRoutePath(id) {
  return `${routePath}/${id}/end`;
}

describe('transition shipment to completed', function() {
  it('should require token auth', async function() {
    await helper.expect.notAuthorized(helper.getApp(), 'invalid token', method, getRoutePath(fakeId));
  });

  it('should require role auth', async function() {
    const app = helper.getApp();
    const token = await helper.login(app, roleConst.name.dockWorker());
    const res = await helper.expect.forbidden(app, token, method, getRoutePath(fakeId));
    helper.shipment.expectForbiddenRole(res, roleConst.name.deskAgent(), roleConst.name.dockWorker());
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

    res = await helper.shipment.receive.accept(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update
     */

    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.end(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: verify update
     */
    res = await helper.shipment.getById(app, token, id);
    helper.shipment.expectStatusAndUnlocked(res, statusConst.completed());

    /**
     * STEP: verify redundant change is allowed
     */
    res = await helper.shipment.end(app, token, id);
    helper.expect.resStatus(res, successStatus);
  });
});

