/* eslint-disable no-console */

const expect = T.expect;

const shipDal = require('cccommon/dal/shipment');
const constant = require('cccommon/constant');
const roleConst = constant.role;
const helper = T.helper.shippingapi;
const method = 'get';
const routePath = '/shipments';

describe('get shipment list', function() {
  it('should require token auth', async function() {
    await helper.expect.notAuthorized(helper.getApp(), 'invalid token', method, routePath);
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

    /**
     * STEP: request the list as a dock worker
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.list(app, token);
    expect(res.body.shipments).to.have.lengthOf.at.least(1);

    let found;
    res.body.shipments.forEach(ship => {
      if (ship.id === expectedId) {
        found = ship;
        helper.shipment.expectCreateSpecToEqual(created.spec, ship);
      }
    });

    expect(found).to.exist;
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

    /**
     * STEP: request the list as a desk agent
     */
    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.list(app, token);
    expect(res.body.shipments).to.have.lengthOf.at.least(1);

    let found;
    res.body.shipments.forEach(ship => {
      if (ship.id === expectedId) {
        found = ship;
        helper.shipment.expectCreateSpecToEqual(created.spec, ship);
      }
    });

    expect(found).to.exist;
  });
});

describe('get one shipment', function() {
  it('should require token auth', async function() {
    await helper.expect.notAuthorized(helper.getApp(), 'invalid token', method, routePath + '/some_id');
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

    /**
     * STEP: request the shipment as a desk agent
     */
    res = await helper.shipment.getById(app, token, expectedId);
    expect(res.body.id).to.equal(expectedId);
    helper.shipment.expectCreateSpecToEqual(created.spec, res.body);
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

    /**
     * STEP: request the shipment as a dock worker
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.getById(app, token, expectedId);
    expect(res.body.id).to.equal(expectedId);
    helper.shipment.expectCreateSpecToEqual(created.spec, res.body);
  });

  it('should include telemetry fields', async function() {
    const app = helper.getApp();
    let res;
    let token;

    const inputDate = new Date('2017-12-01T18:37:42.304Z');
    const expectedDate = '2017-12-01 18:37:42';
    const expectedLat = 45.5426901;
    const expectedLong = -122.9641066;

    /**
     * STEP: create a shipment as a desk agent
     */
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    token = created.token;
    res = created.res;
    expect(res.body.id).to.be.above(0);
    const expectedId = res.body.id;

    /**
     * STEP: verify initial values
     */

    res = await helper.shipment.getById(app, token, expectedId);
    expect(res.body.id).to.equal(expectedId);
    expect(res.body.telemetry).to.be.deepEqualAndDefined({
      reportingTime: null,
      location: {
        latitude: null,
        longitude: null
      }
    });

    /**
     * STEP: update to non-null values
     */
    let shipment = await shipDal.findByPrimaryKey(expectedId);
    await shipment.update({
      telemetryReportingTime: inputDate,
      telemetryLatitude: expectedLat,
      telemetryLongitude: expectedLong
    });

    /**
     * STEP: verify updated values
     */
    res = await helper.shipment.getById(app, token, expectedId);
    expect(res.body.id).to.equal(expectedId);
    expect(res.body.telemetry).to.be.deepEqualAndDefined({
      reportingTime: expectedDate,
      location: {
        latitude: expectedLat,
        longitude: expectedLong
      }
    });

    /**
     * STEP: update to null values
     */
    shipment = await shipDal.findByPrimaryKey(expectedId);
    await shipment.update({
      telemetryReportingTime: null,
      telemetryLatitude: null,
      telemetryLongitude: null
    });

    /**
     * STEP: verify null values
     */

    res = await helper.shipment.getById(app, token, expectedId);
    expect(res.body.id).to.equal(expectedId);
    expect(res.body.telemetry).to.be.deepEqualAndDefined({
      reportingTime: null,
      location: {
        latitude: null,
        longitude: null
      }
    });
  });
});
