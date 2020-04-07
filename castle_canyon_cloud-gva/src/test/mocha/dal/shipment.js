const expect = T.expect;
const shipmentDal = T.dal.shipment;
const testShip = T.data.shipment;
const format = require('cccommon/format');
const userDal = require('cccommon/dal/user');
const shipDal = require('cccommon/dal/shipment');
const constant = require('cccommon/constant');
const roleConst = constant.role;
const now = new Date();

describe('shipment dal', function() {
  async function createRandShipment() {
    const data = testShip.any();
    return [data, await shipmentDal.create(data)];
  }

  async function findByPrimaryKey(id) {
    let shipment = await shipmentDal.findByPrimaryKey(id);
    expect(shipment.id).to.be.equalAndDefined(id);
    return shipment;
  }

  describe('#create()', function() {
    it('should create top-level values', async function() {
      let expectedData, actualShipment;

      [expectedData, actualShipment] = await createRandShipment();

      expect(actualShipment.id).to.be.a('number');
      expect(actualShipment.status).to.be.equalAndDefined(expectedData.status);
      expect(actualShipment.shipmentId).to.be.equalAndDefined(expectedData.shipmentId);
      expect(actualShipment.uShipmentId).to.be.equalAndDefined(expectedData.uShipmentId);
      expect(actualShipment.shippingUnitCount).to.be.equalAndDefined(expectedData.shippingUnitCount);
      expect(actualShipment.referenceId).to.be.equalAndDefined(expectedData.referenceId);
      expect(actualShipment.shipmentNote).to.be.equalAndDefined(expectedData.shipmentNote);
      expect(actualShipment.customerName).to.be.equalAndDefined(expectedData.customerName);
      expect(actualShipment.customerEmail).to.be.equalAndDefined(expectedData.customerEmail);
      expect(format.datetime.toMysql(actualShipment.earliestPickup)).to.be.equalAndDefined(expectedData.earliestPickup);

      expect(actualShipment.customerAddrLine1).to.be.equalAndDefined(expectedData.customerAddrLine1);
      expect(actualShipment.customerAddrCity).to.be.equalAndDefined(expectedData.customerAddrCity);
      expect(actualShipment.customerAddrState).to.be.equalAndDefined(expectedData.customerAddrState);
      expect(actualShipment.customerAddrPin).to.be.equalAndDefined(expectedData.customerAddrPin);
      expect(actualShipment.customerAddrCountry).to.be.equalAndDefined(expectedData.customerAddrCountry);
      expect(actualShipment.customerAddrPhone).to.be.equalAndDefined(expectedData.customerAddrPhone);

      expect(format.datetime.toMysql(actualShipment.latestDelivery)).to.be.equalAndDefined(expectedData.latestDelivery);
      expect(actualShipment.tag2GwReportingTime).to.be.equalAndDefined(expectedData.tag2GwReportingTime);
      expect(actualShipment.gw2CloudReportingTime).to.be.equalAndDefined(expectedData.gw2CloudReportingTime);
      expect(actualShipment.createdAt).to.be.at.least(now);
      expect(actualShipment.updatedAt).to.be.at.least(now);
    });

    it('should create associated legs', async function() {
      let expectedData, actualShipment;

      [expectedData, actualShipment] = await createRandShipment();

      expectedData.legs.forEach((leg, l) => {
        expect(actualShipment.legs[l].order).to.be.equalAndDefined(leg.order);

        expect(actualShipment.legs[l].fromLabel).to.be.equalAndDefined(leg.fromLabel);
        expect(actualShipment.legs[l].fromLine1).to.be.equalAndDefined(leg.fromLine1);
        expect(actualShipment.legs[l].fromCity).to.be.equalAndDefined(leg.fromCity);
        expect(actualShipment.legs[l].fromState).to.be.equalAndDefined(leg.fromState);
        expect(actualShipment.legs[l].fromPin).to.be.equalAndDefined(leg.fromPin);
        expect(actualShipment.legs[l].fromCountry).to.be.equalAndDefined(leg.fromCountry);
        expect(actualShipment.legs[l].fromPhone).to.be.equalAndDefined(leg.fromPhone);

        expect(actualShipment.legs[l].toLabel).to.be.equalAndDefined(leg.toLabel);
        expect(actualShipment.legs[l].toLine1).to.be.equalAndDefined(leg.toLine1);
        expect(actualShipment.legs[l].toCity).to.be.equalAndDefined(leg.toCity);
        expect(actualShipment.legs[l].toState).to.be.equalAndDefined(leg.toState);
        expect(actualShipment.legs[l].toPin).to.be.equalAndDefined(leg.toPin);
        expect(actualShipment.legs[l].toCountry).to.be.equalAndDefined(leg.toCountry);
        expect(actualShipment.legs[l].toPhone).to.be.equalAndDefined(leg.toPhone);

        expect(actualShipment.legs[l].createdAt).to.be.at.least(now);
        expect(actualShipment.legs[l].updatedAt).to.be.at.least(now);
      });
    });

    it('should create associated gateway', async function() {
      let expectedData, actualShipment;

      [expectedData, actualShipment] = await createRandShipment();

      expectedData.gateways.forEach((gateway, g) => {
        expect(actualShipment.gateways[g].uuid).to.be.equalAndDefined(gateway.uuid);
        expect(actualShipment.gateways[g].wsnId).to.be.equalAndDefined(gateway.wsnId);
        expect(actualShipment.gateways[g].panId).to.be.equalAndDefined(gateway.panId);
        expect(actualShipment.gateways[g].channelId).to.be.equalAndDefined(gateway.channelId);
        expect(actualShipment.gateways[g].createdAt).to.be.at.least(now);
        expect(actualShipment.gateways[g].updatedAt).to.be.at.least(now);
      });
    });

    it('should create associated shippingUnits', async function() {
      let expectedData, actualShipment;

      [expectedData, actualShipment] = await createRandShipment();

      expectedData.gateways.forEach((gateway, g) => {
        gateway.shippingUnits.forEach((shippingUnit, su) => {
          expect(actualShipment.gateways[g].shippingUnits[su].packageId).to.be.equalAndDefined(shippingUnit.packageId);
          expect(actualShipment.gateways[g].shippingUnits[su].createdAt).to.be.at.least(now);
          expect(actualShipment.gateways[g].shippingUnits[su].updatedAt).to.be.at.least(now);
        });
      });
    });

    it('should create associated tags', async function() {
      let expectedData, actualShipment;

      [expectedData, actualShipment] = await createRandShipment();

      expectedData.gateways.forEach((gateway, g) => {
        gateway.shippingUnits.forEach((shippingUnit, su) => {
          shippingUnit.tags.forEach((tag, t) => {
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].uuid).to.be.equalAndDefined(tag.uuid);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].wsnId).to.be.equalAndDefined(tag.wsnId);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].temperatureMin).to.be.equalAndDefined(tag.temperatureMin);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].temperatureMax).to.be.equalAndDefined(tag.temperatureMax);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].humidityMin).to.be.equalAndDefined(tag.humidityMin);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].humidityMax).to.be.equalAndDefined(tag.humidityMax);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].lightMin).to.be.equalAndDefined(tag.lightMin);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].lightMax).to.be.equalAndDefined(tag.lightMax);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].pressureMin).to.be.equalAndDefined(tag.pressureMin);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].pressureMax).to.be.equalAndDefined(tag.pressureMax);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].tiltMax).to.be.equalAndDefined(tag.tiltMax);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].shockMax).to.be.equalAndDefined(tag.shockMax);
            expect(actualShipment.gateways[g].shippingUnits[su].tags[t].batteryMin).to.be.equalAndDefined(tag.batteryMin);
          });
        });
      });
    });
  });

  /**
   * These tests will not duplicate the per-field expectations covered in #create tests. Instead,
   * the focus will be on whether or not the query includes all the expected associations. For those
   * assertions, the focus will be on whether specific entity IDs are found in the results.
   *
   * Also:
   *
   * - Manual iteration is used for comparisons when operations like chai's deep.equal() will result
   *   in infinite loops due to unhandled circular references.
   */
  describe('#findByPrimaryKey()', function() {
    it('should include associated legs', async function() {
      let expected, actual;

      [, expected] = await createRandShipment();
      actual = await findByPrimaryKey(expected.id);

      expect(actual.legs.length).to.be.at.least(1);

      const expectedIds = [], actualIds = [];

      expected.legs.forEach((leg, l) => {
        expectedIds.push(leg.id);
        actualIds.push(actual.legs[l].id);
      });

      expect(actualIds).to.be.equalArray(expectedIds);
    });

    it('should include associated gateway', async function() {
      let expected, actual;

      [, expected] = await createRandShipment();
      actual = await findByPrimaryKey(expected.id);

      const expectedIds = [], actualIds = [];

      expect(actual.gateways.length).to.be.at.least(1);

      expected.gateways.forEach((gateway, g) => {
        expectedIds.push(gateway.id);
        actualIds.push(actual.gateways[g].id);
      });

      expect(actualIds).to.be.equalArray(expectedIds);
    });

    it('should include associated shippingUnits', async function() {
      let expected, actual;

      [, expected] = await createRandShipment();
      actual = await findByPrimaryKey(expected.id);

      expected.gateways.forEach((gateway, g) => {
        const expectedIds = [], actualIds = [];

        expect(actual.gateways[g].shippingUnits.length).to.be.at.least(1);

        gateway.shippingUnits.forEach((shippingUnit, su) => {
          expectedIds.push(shippingUnit.id);
          actualIds.push(actual.gateways[g].shippingUnits[su].id);
        });

        expect(actualIds).to.be.equalArray(expectedIds);
      });
    });

    it('should include associated tags', async function() {
      let expected, actual;

      [, expected] = await createRandShipment();
      actual = await findByPrimaryKey(expected.id);

      expected.gateways.forEach((gateway, g) => {
        gateway.shippingUnits.forEach((shippingUnit, su) => {
          const expectedIds = [], actualIds = [];

          expect(actual.gateways[g].shippingUnits[su].tags.length).to.be.at.least(1);

          shippingUnit.tags.forEach((tag, t) => {
            expectedIds.push(tag.id);
            actualIds.push(actual.gateways[g].shippingUnits[su].tags[t].id);
          });

          expect(actualIds).to.be.equalArray(expectedIds);
        });
      });
    });

    it('should include handle presence of associated status lock user', async function() {
      let expected, actual;

      [, expected] = await createRandShipment();
      actual = await findByPrimaryKey(expected.id);

      let user = await userDal.findByEmail(T.data.user.getDevUser(roleConst.name.dockWorker()).username());
      await shipDal.updateStatusLockUser(actual, user);
      actual = await findByPrimaryKey(expected.id);

      expect(actual.statusLockUser.get('id')).to.be.equalAndDefined(user.get('id'));
    });

    it('should include handle lack of associated status lock user', async function() {
      let expected, actual;

      [, expected] = await createRandShipment();
      actual = await findByPrimaryKey(expected.id);

      expect(actual.statusLockUser).to.be.null;
    });
  });

  describe('#findByGatewayUUID()', function() {
    it('should reverse look up the shipment', async function() {
      const [, shipment] = await createRandShipment();
      const expectedId = shipment.get('id');
      expect(expectedId).to.be.above(1);

      for (let gateway of shipment.gateways) {
        const found = await shipDal.findByGatewayUUID(gateway.uuid);
        const actualIds = [];
        for (let foundShip of found) {
          actualIds.push(foundShip.get('id'));
        }
        expect(actualIds).to.be.equalArray([expectedId]);
      }
    });
  });

  describe('#findByTagUUID()', function() {
    it('should reverse look up the shipment', async function() {
      const [, shipment] = await createRandShipment();
      const expectedId = shipment.get('id');
      expect(expectedId).to.be.above(1);

      const actualIds = [];

      for (let gateway of shipment.gateways) {
        for (let shippingUnit of gateway.shippingUnits) {
          for (let tag of shippingUnit.tags) {
            const found = await shipDal.findByTagUUID(tag.uuid);
            for (let foundShip of found) {
              actualIds.push(foundShip.get('id'));
            }
          }
        }
      }

      expect(actualIds).to.be.equalArray([expectedId]);
    });
  });
});
