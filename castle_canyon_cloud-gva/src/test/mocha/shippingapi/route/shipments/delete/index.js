/* eslint-disable no-console */

const expect = T.expect;

const request = require('supertest');
const constant = require('cccommon/constant');
const roleConst = constant.role;
const helper = T.helper.shippingapi;
const method = 'delete';
const routePath = '/shipments';

describe('delete one shipment', function() {
  it('should require token auth', async function() {
    await helper.expect.notAuthorized(helper.getApp(), 'invalid token', method, routePath + '/500');
  });

  it('should require env flag', async function() {
    const backup = process.env.gva_shippingapi_expose_developer_endpoints;
    process.env.gva_shippingapi_expose_developer_endpoints = '';

    const app = helper.getApp();

    const token = await helper.login(app, roleConst.name.deskAgent());
    const res = await request(app).delete('/shipments/500')
      .set(...helper.tokenHeader(token));

    helper.expect.resStatus(res, 404);

    process.env.gva_shippingapi_expose_developer_endpoints = backup;
  });

  it('should allow desk agent', async function() {
    const app = helper.getApp();
    let res;
    let token;

    /**
     * STEP: create a shipment as a desk agent
     */
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    token = created.token;
    res = created.res;
    expect(res.body.id).to.be.above(0);
    const expectedId = res.body.id;

    res = await helper.shipment.getById(app, token, expectedId);
    expect(res.body.id).to.equal(expectedId);

    /**
     * STEP: attempt deletion
     */
    res = await helper.shipment.deleteOne(app, token, expectedId);

    /**
     * STEP: verify
     */
    res = await helper.shipment.getById(app, token, expectedId);
    helper.expect.resStatus(res, 404);
  });

  it('should allow dock worker', async function() {
    const app = helper.getApp();
    let res;
    let token;

    /**
     * STEP: create a shipment as a desk agent
     */
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    token = created.token;
    res = created.res;
    expect(res.body.id).to.be.above(0);
    const expectedId = res.body.id;

    res = await helper.shipment.getById(app, token, expectedId);
    expect(res.body.id).to.equal(expectedId);

    /**
     * STEP: attempt deletion
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.deleteOne(app, token, expectedId);

    /**
     * STEP: verify
     */
    res = await helper.shipment.getById(app, token, expectedId);
    helper.expect.resStatus(res, 404);
  });
});

describe('delete all shipments', function() {
  it('should require token auth', async function() {
    await helper.expect.notAuthorized(helper.getApp(), 'invalid token', method, routePath);
  });

  it('should require env flag', async function() {
    const backup = process.env.gva_shippingapi_expose_developer_endpoints;
    process.env.gva_shippingapi_expose_developer_endpoints = '';

    const app = helper.getApp();

    const token = await helper.login(app, roleConst.name.dockWorker());
    const res = await request(app).delete('/shipments')
      .set(...helper.tokenHeader(token));

    helper.expect.resStatus(res, 404);

    process.env.gva_shippingapi_expose_developer_endpoints = backup;
  });

  it('should allow desk agent', async function() {
    const app = helper.getApp();
    let res;
    let token;

    /**
     * STEP: clean slate
     */
    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.deleteAll(app, token);
    helper.expect.resStatus(res, 204);

    /**
     * STEP: create two shipments as a desk agent
     */
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    token = created.token;
    res = created.res;
    const firstId = res.body.id;

    created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    res = created.res;
    const secondId = res.body.id;

    res = await helper.shipment.list(app, token);
    expect(res.body.shipments).to.have.lengthOf(2);

    /**
     * STEP: attempt deletion
     */
    res = await helper.shipment.deleteAll(app, token);
    helper.expect.resStatus(res, 204);

    /**
     * STEP: verify
     */
    res = await helper.shipment.list(app, token);
    expect(res.body.shipments).to.have.lengthOf(0);

    res = await helper.shipment.getById(app, token, firstId);
    helper.expect.resStatus(res, 404);

    res = await helper.shipment.getById(app, token, secondId);
    helper.expect.resStatus(res, 404);
  });

  it('should allow dock worker', async function() {
    const app = helper.getApp();
    let res;
    let token;

    /**
     * STEP: clean slate
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.deleteAll(app, token);
    helper.expect.resStatus(res, 204);

    /**
     * STEP: create two shipments as a desk agent
     */
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    token = created.token;
    res = created.res;
    const firstId = res.body.id;

    created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    res = created.res;
    const secondId = res.body.id;

    res = await helper.shipment.list(app, token);
    expect(res.body.shipments).to.have.lengthOf(2);

    /**
     * STEP: attempt deletion
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.deleteAll(app, token);
    helper.expect.resStatus(res, 204);

    /**
     * STEP: verify
     */
    res = await helper.shipment.list(app, token);
    expect(res.body.shipments).to.have.lengthOf(0);

    res = await helper.shipment.getById(app, token, firstId);
    helper.expect.resStatus(res, 404);

    res = await helper.shipment.getById(app, token, secondId);
    helper.expect.resStatus(res, 404);
  });
});
