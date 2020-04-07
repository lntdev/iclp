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
  return `${routePath}/${id}/monitor/config`;
}

describe('change monitor config', function() {
  it('should require token auth', async function() {
    await helper.expect.notAuthorized(helper.getApp(), 'invalid token', method, getRoutePath(fakeId));
  });

  it('should require role auth', async function() {
    const app = helper.getApp();
    const token = await helper.login(app, roleConst.name.dockWorker());
    const res = await helper.expect.forbidden(app, token, method, getRoutePath(fakeId));
    helper.shipment.expectForbiddenRole(res, roleConst.name.deskAgent(), roleConst.name.dockWorker());
  });

  it('should require inMonitoring status', async function() {
    const app = helper.getApp();
    let res;
    let token;

    /**
     * STEP: create a shipment as a desk agent
     */
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    token = created.token;
    const id = created.res.body.id;

    res = await helper.shipment.getById(app, token, id);

    /**
     * STEP: attempt update
     */
    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.getById(app, token, id);
    const configChange = helper.shipment.shipResBodyToMonitorConfigPutReqBody(res.body);

    res = await helper.shipment.monitor.config(app, token, id, configChange);
    helper.shipment.expectStatusConflict(res, statusConst.new(), statusConst.inMonitoring());
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

    res = await helper.shipment.getById(app, token, id);
    const origShip = res.body;

    /**
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: set up monitor status
     */

    const initialConfig = T.data.monitor.validPut();
    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update
     */
    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.getById(app, token, id);
    const configChange = helper.shipment.shipResBodyToMonitorConfigPutReqBody(res.body);

    res = await helper.shipment.monitor.config(app, token, id, configChange);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: verify update
     */
    res = await helper.shipment.getById(app, token, id);
    expect(res.body.status).to.be.equalAndDefined(statusConst.inMonitoring());

    const merge = Object.assign({}, initialConfig, configChange);
    merge.gateways = helper.shipment.mergeGateways(initialConfig.gateways, configChange.gateways);

    let expected = helper.shipment.buildExpected(origShip, {
      merge: merge
    });

    helper.shipment.expectUpdated(expected, res.body);
  });

  it('should update shipment with zero value thresholds', async function() {
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

    res = await helper.shipment.getById(app, token, id);
    const origShip = res.body;

    /**
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: set up monitor status
     */

    const initialConfig = T.data.monitor.validPut();
    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update
     */
    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.getById(app, token, id);
    const configChange = helper.shipment.zeroValueThresholdMonitorConfigPutReqBody(res.body);

    res = await helper.shipment.monitor.config(app, token, id, configChange);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: verify update
     */
    res = await helper.shipment.getById(app, token, id);
    expect(res.body.status).to.be.equalAndDefined(statusConst.inMonitoring());

    const merge = Object.assign({}, initialConfig, configChange);
    merge.gateways = helper.shipment.mergeGateways(initialConfig.gateways, configChange.gateways);

    let expected = helper.shipment.buildExpected(origShip, {
      merge: merge
    });

    helper.shipment.expectUpdated(expected, res.body);
  });

  it('should update shipment with negative value thresholds', async function() {
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

    res = await helper.shipment.getById(app, token, id);
    const origShip = res.body;

    /**
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: set up monitor status
     */

    const initialConfig = T.data.monitor.validPut();
    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update
     */
    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.getById(app, token, id);
    const configChange = helper.shipment.negValueThresholdMonitorConfigPutReqBody(res.body);

    res = await helper.shipment.monitor.config(app, token, id, configChange);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: verify update
     */
    res = await helper.shipment.getById(app, token, id);
    expect(res.body.status).to.be.equalAndDefined(statusConst.inMonitoring());

    const merge = Object.assign({}, initialConfig, configChange);
    merge.gateways = helper.shipment.mergeGateways(initialConfig.gateways, configChange.gateways);

    let expected = helper.shipment.buildExpected(origShip, {
      merge: merge
    });

    helper.shipment.expectUpdated(expected, res.body);
  });

  it('should detect invalid shippingUnit element count', async function() {
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

    res = await helper.shipment.getById(app, token, id);

    /**
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: set up monitor status
     */

    const initialConfig = T.data.monitor.validPut();
    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update
     */
    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.getById(app, token, id);
    const configChange = helper.shipment.shipResBodyToMonitorConfigPutReqBody(res.body);
    configChange.gateways[0].shippingUnits.push(configChange.gateways[0].shippingUnits[0]);

    res = await helper.shipment.monitor.config(app, token, id, configChange);
    helper.shipment.expectInputValidationFailed(res);
    expect(res.body.details['gateway[0].shippingUnits']).to.equal('received 3, expected 2');
  });

});
