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
  return `${routePath}/${id}/monitor`;
}

describe('transition to inMonitoring', function() {
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

    /**
     * STEP: attempt update (with a different dock worker)
     */
    token = await helper.login(app, roleConst.name.dockWorker() + '-two');
    res = await helper.shipment.monitor(app, token, id);
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

    res = await helper.shipment.getById(app, token, id);
    const origShip = res.body;

    /**
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update
     */

    const initialConfig = T.data.monitor.validPut();

    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: verify update
     */
    res = await helper.shipment.getById(app, token, id);
    expect(res.body.status).to.be.equalAndDefined(statusConst.inMonitoring());

    let expected = helper.shipment.buildExpected(origShip, {
      merge: initialConfig
    });

    helper.shipment.expectUpdated(expected, res.body);

    /**
     * STEP: verify redundant change is allowed
     */
    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, successStatus);
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
     * STEP: attempt update
     */
    const initialConfig = T.data.monitor.validPut();
    initialConfig.gateways[0].shippingUnits.push(initialConfig.gateways[0].shippingUnits[0]);

    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.shipment.expectInputValidationFailed(res);
    expect(res.body.details['gateway[0].shippingUnits']).to.equal('received 3, expected 2');
  });

  it('should detect gateway in use', async function() {
    const app = helper.getApp();
    const successStatus = 204;
    let res;
    let token;

    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.deleteAll(app, token);
    helper.expect.resStatus(res, 204);

    /**
     * STEP: create a shipment as a desk agent
     */
    const createSpec = {
      shipmentId: '{{$timestamp}}',
      uShipmentId: T.data.shipment.anyUniqueShipmentId(),
      shipmentName: 'OBT Test shipment',
      referenceId: 'Reference Field ID ',
      shippingUnitCount: 2,
      shipmentNote: 'This is a note about the shipment',
      customerName: 'Intel Corporation',
      customerEmail: 'testemail@gmail.com',
      customerAddress: {
        line1: '12345 SW King ST',
        city: 'Beaverton',
        state: 'OR',
        pin: '97005',
        country: 'USA',
        phone: '503-555-1331'
      },
      earliestPickup: '2017-11-22 12:00:00',
      pickupAddress: {
        line1: '2111 NE 25th Avenue',
        city: 'Hillsboro',
        state: 'OR',
        pin: '97124',
        country: 'USA',
        phone: '555-168-8245'
      },
      latestDelivery: '2017-11-28 11:40:00',
      deliveryAddress: {
        line1: '5000 W. Chandler Boulevard',
        city: 'Chandeler',
        state: 'AZ',
        pin: '85226',
        country: 'USA',
        phone: '503-888-7777'
      },
      tag2GwReportingTime: 60,
      gw2CloudReportingTime: 900,
      gateways: [
        {
          shippingUnits: [
            {
              tags: [
                {
                  thresholds: {
                    temperature: { min: 10, max: 70 },
                    humidity: { min: 10, max: 70 },
                    light: { min: 10, max: 70 },
                    pressure: { min: 10, max: 70 },
                    tilt: { max: 50 },
                    shock: { max: 10 },
                    battery: { min: 2000 }
                  }
                }
              ]
            }
          ]
        }
      ]
    };
    let created = await helper.shipment.loginAndCreateAs(app, roleConst.name.deskAgent(), createSpec);
    helper.expect.resStatus(created.res, 201);
    token = created.token;
    let id = created.res.body.id;
    const firstId = id;

    res = await helper.shipment.getById(app, token, id);

    /**
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update
     */

    const initialConfig = {
      gateways: [
        {
          id: '12346785',
          shippingUnits: [
            {
              id: '43456456',
              tags: [
                {
                  id: '12353',
                  wsnId: 10
                }
              ]
            },
            {
              id: '67845423',
              tags: [
                {
                  id: '45238',
                  wsnId: 11
                }
              ]
            }
          ]
        }
      ]
    };
    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, successStatus);

    /**
     * ATTEMPT DUPLICATE GATEWAY
     */

    createSpec.uShipmentId = T.data.shipment.anyUniqueShipmentId();
    created = await helper.shipment.loginAndCreateAs(app, roleConst.name.deskAgent(), createSpec);
    helper.expect.resStatus(created.res, 201);
    token = created.token;
    id = created.res.body.id;

    res = await helper.shipment.getById(app, token, id);

    /**
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update, expect error
     */

    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, 400);

    expect(res.body.details['gateway[0].id']).to.equal(`gateway [12346785] is in use by shipment [ID: ${firstId}]`);

    /**
     * STEP: attempt update again with conflict deinstrumented, expect success
     */
    res = await helper.shipment.receive(app, token, firstId);
    helper.expect.resStatus(res, successStatus);

    res = await helper.shipment.receive.accept(app, token, firstId);
    helper.expect.resStatus(res, successStatus);

    res = await helper.shipment.receive.deinstrument(app, token, firstId);
    helper.expect.resStatus(res, successStatus);

    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, successStatus);
  });

  it('should detect tag in use', async function() {
    const app = helper.getApp();
    const successStatus = 204;
    let res;
    let token;

    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.deleteAll(app, token);
    helper.expect.resStatus(res, 204);

    /**
     * STEP: create a shipment as a desk agent
     */
    const createSpec = {
      shipmentId: '{{$timestamp}}',
      uShipmentId: T.data.shipment.anyUniqueShipmentId(),
      shipmentName: 'OBT Test shipment',
      referenceId: 'Reference Field ID ',
      shippingUnitCount: 2,
      shipmentNote: 'This is a note about the shipment',
      customerName: 'Intel Corporation',
      customerEmail: 'testemail@gmail.com',
      customerAddress: {
        line1: '12345 SW King ST',
        city: 'Beaverton',
        state: 'OR',
        pin: '97005',
        country: 'USA',
        phone: '503-555-1331'
      },
      earliestPickup: '2017-11-22 12:00:00',
      pickupAddress: {
        line1: '2111 NE 25th Avenue',
        city: 'Hillsboro',
        state: 'OR',
        pin: '97124',
        country: 'USA',
        phone: '555-168-8245'
      },
      latestDelivery: '2017-11-28 11:40:00',
      deliveryAddress: {
        line1: '5000 W. Chandler Boulevard',
        city: 'Chandeler',
        state: 'AZ',
        pin: '85226',
        country: 'USA',
        phone: '503-888-7777'
      },
      tag2GwReportingTime: 60,
      gw2CloudReportingTime: 900,
      gateways: [
        {
          shippingUnits: [
            {
              tags: [
                {
                  thresholds: {
                    temperature: { min: 10, max: 70 },
                    humidity: { min: 10, max: 70 },
                    light: { min: 10, max: 70 },
                    pressure: { min: 10, max: 70 },
                    tilt: { max: 50 },
                    shock: { max: 10 },
                    battery: { min: 2000 }
                  }
                }
              ]
            }
          ]
        }
      ]
    };
    let created = await helper.shipment.loginAndCreateAs(app, roleConst.name.deskAgent(), createSpec);
    helper.expect.resStatus(created.res, 201);
    token = created.token;
    let id = created.res.body.id;
    const firstId = id;

    res = await helper.shipment.getById(app, token, id);

    /**
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update
     */

    const initialConfig = {
      gateways: [
        {
          id: '12346785',
          shippingUnits: [
            {
              id: '43456456',
              tags: [
                {
                  id: '12353',
                  wsnId: 10
                }
              ]
            },
            {
              id: '67845423',
              tags: [
                {
                  id: '45238',
                  wsnId: 11
                }
              ]
            }
          ]
        }
      ]
    };
    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, successStatus);

    /**
     * ATTEMPT DUPLICATE GATEWAY
     */

    createSpec.uShipmentId = T.data.shipment.anyUniqueShipmentId();

    created = await helper.shipment.loginAndCreateAs(app, roleConst.name.deskAgent(), createSpec);
    helper.expect.resStatus(created.res, 201);
    token = created.token;
    id = created.res.body.id;

    res = await helper.shipment.getById(app, token, id);

    /**
     * STEP: setup required state to transition from
     */
    token = await helper.login(app, roleConst.name.dockWorker());
    res = await helper.shipment.provision(app, token, id);
    helper.expect.resStatus(res, successStatus);

    /**
     * STEP: attempt update, expect error
     */

    initialConfig.gateways[0].id = initialConfig.gateways[0].id + '-2'; // Prevent gateway conflict

    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, 400);

    expect(res.body.details['gateway[0].shippingUnit[0].tags[0].id']).to.equal(`tag [12353] is in use by shipment [ID: ${firstId}]`);

    /**
     * STEP: attempt update again with conflict deinstrumented, expect success
     */

    res = await helper.shipment.receive(app, token, firstId);
    helper.expect.resStatus(res, successStatus);

    res = await helper.shipment.receive.accept(app, token, firstId);
    helper.expect.resStatus(res, successStatus);

    res = await helper.shipment.receive.deinstrument(app, token, firstId);
    helper.expect.resStatus(res, successStatus);

    res = await helper.shipment.monitor(app, token, id, initialConfig);
    helper.expect.resStatus(res, successStatus);
  });
});
