/* eslint-disable no-console */

const expect = T.expect;

const constant = require('cccommon/constant');
const roleConst = constant.role;
const helper = T.helper.shippingapi;
const method = 'post';
const routePath = '/shipments';

describe('create shipment', function() {
  it('should require token auth', async function() {
    await helper.expect.notAuthorized(helper.getApp(), 'invalid token', method, routePath);
  });

  it('should require role auth', async function() {
    const app = helper.getApp();
    const token = await helper.login(app, constant.role.name.dockWorker());
    const res = await helper.expect.forbidden(app, token, method, routePath);
    helper.shipment.expectForbiddenRole(res, roleConst.name.deskAgent(), roleConst.name.dockWorker());
  });

  it('should save shipment', async function() {
    const app = helper.getApp();
    const token = await helper.login(app, constant.role.name.deskAgent());
    const res = await helper.shipment.create(app, token, T.data.reqBody.shipments.validPost());

    helper.expect.resStatus(res, 201);
    expect(res.body.id).to.be.above(0);
  });

  it('should reject invalid shippingUnitCount', async function() {
    const app = helper.getApp();
    const token = await helper.login(app, constant.role.name.deskAgent());
    const validPost = T.data.reqBody.shipments.validPost();
    validPost.shippingUnitCount = -1;
    const res = await helper.shipment.create(app, token, validPost);

    helper.expect.resStatus(res, 400);
    expect(res.body.details.shippingUnitCount).to.equal('must be greater than 0');
  });

  it('should support zero value thresholds', async function() {
    const app = helper.getApp();
    let res;

    const createSpec = T.data.reqBody.shipments.zeroValueThresholdsPost();
    const created = await helper.shipment.loginAndCreateAs(app, roleConst.name.deskAgent(), createSpec);

    res = await helper.shipment.getById(app, created.token, created.res.body.id);
    helper.shipment.expectCreateSpecToEqual(createSpec, res.body);
  });

  it('should support negative value thresholds', async function() {
    const app = helper.getApp();
    let res;

    const createSpec = T.data.reqBody.shipments.negValueThresholdsPost();
    const created = await helper.shipment.loginAndCreateAs(app, roleConst.name.deskAgent(), createSpec);

    res = await helper.shipment.getById(app, created.token, created.res.body.id);
    helper.shipment.expectCreateSpecToEqual(createSpec, res.body);
  });

  // DECEMBER HACK
  it('should fill in shippingUnit nodes to match shippingUnitCount', async function() {
    const app = helper.getApp();
    let res;

    const createSpec = T.data.reqBody.shipments.validPost();

    const createSpecWithMissing = T.deepMerge(createSpec);
    createSpecWithMissing.shippingUnitCount = 2;
    createSpecWithMissing.gateways[0].shippingUnits = [
      createSpecWithMissing.gateways[0].shippingUnits[0]
    ];

    const created = await helper.shipment.loginAndCreateAs(app, roleConst.name.deskAgent(), createSpecWithMissing);
    helper.expect.resStatus(created.res, 201);

    res = await helper.shipment.getById(app, created.token, created.res.body.id);
    helper.shipment.expectCreateSpecToEqual(createSpec, res.body);
  });

  it('should allow empty shipmentNote', async function() {
    const app = helper.getApp();
    const token = await helper.login(app, constant.role.name.deskAgent());
    const validPost = T.data.reqBody.shipments.validPost();
    delete validPost.shipmentNote;
    const res = await helper.shipment.create(app, token, validPost);

    helper.expect.resStatus(res, 201);
  });

  it('should allow empty referenceId', async function() {
    const app = helper.getApp();
    const token = await helper.login(app, constant.role.name.deskAgent());
    const validPost = T.data.reqBody.shipments.validPost();
    delete validPost.referenceId;
    const res = await helper.shipment.create(app, token, validPost);

    helper.expect.resStatus(res, 201);
  });
});

