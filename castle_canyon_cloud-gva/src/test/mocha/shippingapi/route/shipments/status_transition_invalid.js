/* eslint-disable no-console */

const constant = require('cccommon/constant');
const roleConst = constant.role;
const statusConst = constant.status;
const helper = T.helper.shippingapi;

describe('status_transition_invalid', function() {
  it('should protect accept-path endpoints', async function() {
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

    token = await helper.login(app, roleConst.name.dockWorker());

    /**
     * STEP: INVALID TRANSITION
     */
    res = await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    helper.shipment.expectStatusTransInvalid(res, statusConst.new());

    /**
     * STEP: VALID TRANSITION
     */

    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.receive(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.inProvision());

    /**
     * STEP: VALID TRANSITION
     */
    res = await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.provision(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.inMonitoring());

    /**
     * STEP: VALID TRANSITION
     */
    res = await helper.shipment.receive(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.provision(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.inReceiving());

    /**
     * STEP: VALID TRANSITION
     */
    res = await helper.shipment.receive.accept(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    helper.shipment.expectStatusTransInvalid(res, statusConst.accepted());

    /**
     * STEP: VALID TRANSITION
     */

    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.end(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.receive(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.completed());

    /**
     * STEP: VALID TRANSITION
     */

    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.receive.deinstrument(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.receive(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.completedDeinstrumented());
  });

  it('should protect acceptDeinstrumented-path endpoints', async function() {
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

    token = await helper.login(app, roleConst.name.dockWorker());

    /**
     * STEP: INVALID TRANSITION
     */
    res = await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    helper.shipment.expectStatusTransInvalid(res, statusConst.new());

    /**
     * STEP: VALID TRANSITION
     */

    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.receive(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.inProvision());

    /**
     * STEP: VALID TRANSITION
     */
    res = await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.provision(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.inMonitoring());

    /**
     * STEP: VALID TRANSITION
     */
    res = await helper.shipment.receive(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.provision(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.inReceiving());

    /**
     * STEP: VALID TRANSITION
     */
    res = await helper.shipment.receive.accept(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    helper.shipment.expectStatusTransInvalid(res, statusConst.accepted());

    /**
     * STEP: VALID TRANSITION
     */

    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.receive.deinstrument(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.receive(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.acceptedDeinstrumented());

    /**
     * STEP: VALID TRANSITION
     */

    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.end(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.receive(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.completedDeinstrumented());
  });

  it('should protect reject-path endpoints', async function() {
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

    token = await helper.login(app, roleConst.name.dockWorker());

    /**
     * STEP: INVALID TRANSITION
     */
    res = await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    helper.shipment.expectStatusTransInvalid(res, statusConst.new());

    /**
     * STEP: VALID TRANSITION
     */

    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.receive(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.inProvision());

    /**
     * STEP: VALID TRANSITION
     */
    res = await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.provision(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.inMonitoring());

    /**
     * STEP: VALID TRANSITION
     */
    res = await helper.shipment.receive(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.provision(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.inReceiving());

    /**
     * STEP: VALID TRANSITION
     */
    res = await helper.shipment.receive.reject(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.receive.accept(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.rejected());

    /**
     * STEP: VALID TRANSITION
     */
    res = await helper.shipment.receive.deinstrument(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * TRY INVALID TRANSITION
     */
    res = await helper.shipment.receive.accept(app, token, id);
    helper.shipment.expectStatusTransInvalid(res, statusConst.rejectedDeinstrumented());
  });
});
