/* eslint-disable no-console */

const expect = T.expect;
const constant = require('cccommon/constant');
const roleConst = constant.role;
const helper = T.helper.shippingapi;
const method = 'put';
const routePath = '/shipments';
const fakeId = 50000;
const models = require('cccommon/models/internaldb');

function getRoutePath(id) {
  return `${routePath}/${id}/receive/deinstrument`;
}

describe('transition shipment to deinstrumented', function() {
  it('should require token auth', async function() {
    await helper.expect.notAuthorized(helper.getApp(), 'invalid token', method, getRoutePath(fakeId));
  });

  it('should require role auth', async function() {
    const app = helper.getApp();
    const token = await helper.login(app, roleConst.name.deskAgent());
    const res = await helper.expect.forbidden(app, token, method, getRoutePath(fakeId));
    helper.shipment.expectForbiddenRole(res, roleConst.name.dockWorker(), roleConst.name.deskAgent());
  });

  it('should remove associated entities', async function() {
    const app = helper.getApp();
    const details = await helper.shipment.createAccepteDeinstrumented(app) ;
    const token = await helper.login(app, roleConst.name.dockWorker());
    const res = await helper.shipment.getById(app, token, details.id);
    helper.expect.resStatus(res, 200);

    // Verify associated entities were deleted
    for (let gateway of details.dalFindRes.gateways) {
      expect(await models.Gateway.findOne({where: {id: gateway.get('id')}})).to.be.null;
      for (let shippingUnit of gateway.shippingUnits) {
        expect(await models.ShippingUnit.findOne({where: {id: shippingUnit.get('id')}})).to.be.null;
        for (let tag of shippingUnit.tags) {
          expect(await models.Tag.findOne({where: {id: tag.get('id')}})).to.be.null;
        }
      }
    }

    // Verify no association found
    expect(res.body.gateways).to.be.deepEqualAndDefined([]);
  });
});
