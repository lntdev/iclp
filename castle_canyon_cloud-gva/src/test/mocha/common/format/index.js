const expect = T.expect;
const shipDal = require('cccommon/dal/shipment');
const format = require('cccommon/format');
const constant = require('cccommon/constant');
const roleConst = constant.role;
const helper = T.helper.shippingapi;

describe('shipment formatter', function() {
  it('should convert model to config change data for GW', async function() {
    const app = helper.getApp();
    let res;
    let token;

    /**
     * STEP: prepare a shipment by moving it through the expected lifecycle stages
     * that preceed the config change.
     */

    // new
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    token = created.token;
    const id = created.res.body.id;

    // inProvision
    token = await helper.login(app, roleConst.name.dockWorker());
    await helper.shipment.provision(app, token, id);

    // inMonitoring
    await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.getById(app, token, id);

    // config change request from Visibility Portal
    await helper.shipment.monitor.config(app, token, id, helper.shipment.shipResBodyToMonitorConfigPutReqBody(res.body));

    const shipment = await shipDal.findByPrimaryKey(id);
    const formatted = format.shipment.modelToConfigChangeTagData(shipment);

    // Add 3 to the values to align with how we've defined the prepared config
    // change values, which are just 3 above the ones set at shipment creation.
    const expected = [
      {
        type: 'light',
        enable: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          min: '' + (T.data.tag.anyLightMin() + 3),
          max: '' + (T.data.tag.anyLightMax() + 3)
        }
      },
      {
        type: 'humidity',
        enable: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          min: '' + (T.data.tag.anyHumidityMin() + 3),
          max: '' + (T.data.tag.anyHumidityMax() + 3)
        }
      },
      {
        type: 'temperature',
        enable: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          min: '' + (T.data.tag.anyTemperatureMin() + 3),
          max: '' + (T.data.tag.anyTemperatureMax() + 3)
        }
      },
      {
        type: 'pressure',
        enable: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          min: '' + (T.data.tag.anyPressureMin() + 3),
          max: '' + (T.data.tag.anyPressureMax() + 3)
        }
      },
      {
        type: 'battery',
        enable: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          min: '' + (T.data.tag.anyBatteryMin() + 3)
        }
      },
      {
        type: 'shock',
        enable: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          max: '' + (T.data.tag.anyShockMax() + 3)
        }
      },
      {
        type: 'tilt',
        enable: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          max: '' + (T.data.tag.anyTiltMax() + 3)
        }
      }
    ];

    // DECEMBER HACK: only one gateway is expected
    expect(formatted.gatewayId).to.be.deepEqualAndDefined(shipment.gateways[0].uuid);

    expect(formatted.configParams).to.be.deepEqualAndDefined(expected);

    expect(formatted.tagWsnIds).to.have.lengthOf(2);
    expect(formatted.tagWsnIds[0]).to.be.above(0x1fff);
    expect(formatted.tagWsnIds[1]).to.be.above(0x1fff);
  });

  it('should convert model to disassociation data for GW', async function() {
    const app = helper.getApp();
    let res;
    let token;

    /**
     * STEP: prepare a shipment by moving it through the expected lifecycle stages
     * that preceed the config change.
     */

    // new
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    token = created.token;
    const id = created.res.body.id;

    // inProvision
    token = await helper.login(app, roleConst.name.dockWorker());
    await helper.shipment.provision(app, token, id);

    // inMonitoring
    await helper.shipment.monitor(app, token, id, T.data.monitor.validPut());
    token = await helper.login(app, roleConst.name.deskAgent());
    res = await helper.shipment.getById(app, token, id);

    // config change request from Visibility Portal
    await helper.shipment.monitor.config(app, token, id, helper.shipment.shipResBodyToMonitorConfigPutReqBody(res.body));

    const shipment = await shipDal.findByPrimaryKey(id);
    const formatted = format.shipment.modelToDisassociationData(shipment);

    // DECEMBER HACK: only one gateway is expected
    expect(formatted.gatewayId).to.be.deepEqualAndDefined(shipment.gateways[0].uuid);

    expect(formatted.tagWsnIds).to.have.lengthOf(2);
    expect(formatted.tagWsnIds[0]).to.be.above(0x1fff);
    expect(formatted.tagWsnIds[1]).to.be.above(0x1fff);
  });
});

describe('data type formatter', function() {
  describe('#forceInt', function() {
    it('should handle string', function() {
      expect(format.dataType.forceInt('2')).to.equal(2);
      expect(format.dataType.forceInt('0')).to.equal(0);
      expect(format.dataType.forceInt('-2')).to.equal(-2);
      expect(format.dataType.forceInt('')).to.equal(0);
      expect(format.dataType.forceInt('word')).to.equal(0);
      expect(format.dataType.forceInt('Infinity')).to.equal(0);
    });

    it('should handle int', function() {
      expect(format.dataType.forceInt(2)).to.equal(2);
      expect(format.dataType.forceInt(0)).to.equal(0);
      expect(format.dataType.forceInt(-2)).to.equal(-2);
    });

    it('should handle unexpected type', function() {
      expect(format.dataType.forceInt(Infinity)).to.equal(0);
      expect(format.dataType.forceInt(NaN)).to.equal(0);
      expect(format.dataType.forceInt(undefined)).to.equal(0);
      expect(format.dataType.forceInt(null)).to.equal(0);
      expect(format.dataType.forceInt({})).to.equal(0);
      expect(format.dataType.forceInt([])).to.equal(0);
    });
  });

  describe('#forceZeroOrPositiveInt', function() {
    it('should handle string', function() {
      expect(format.dataType.forceZeroOrPositiveInt('2')).to.equal(2);
      expect(format.dataType.forceZeroOrPositiveInt('0')).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveInt('-2')).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveInt('')).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveInt('word')).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveInt('Infinity')).to.equal(0);
    });

    it('should handle int', function() {
      expect(format.dataType.forceZeroOrPositiveInt(2)).to.equal(2);
      expect(format.dataType.forceZeroOrPositiveInt(0)).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveInt(-2)).to.equal(0);
    });

    it('should handle unexpected type', function() {
      expect(format.dataType.forceZeroOrPositiveInt(Infinity)).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveInt(NaN)).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveInt(undefined)).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveInt(null)).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveInt({})).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveInt([])).to.equal(0);
    });
  });

  describe('#forceFloat', function() {
    it('should handle string', function() {
      expect(format.dataType.forceFloat('2.5')).to.equal(2.5);
      expect(format.dataType.forceFloat('0')).to.equal(0);
      expect(format.dataType.forceFloat('-2.5')).to.equal(-2.5);
      expect(format.dataType.forceFloat('')).to.equal(0);
      expect(format.dataType.forceFloat('word')).to.equal(0);
      expect(format.dataType.forceFloat('Infinity')).to.equal(0);
    });

    it('should handle float', function() {
      expect(format.dataType.forceFloat(2.5)).to.equal(2.5);
      expect(format.dataType.forceFloat(0)).to.equal(0);
      expect(format.dataType.forceFloat(-2.5)).to.equal(-2.5);
    });

    it('should handle unexpected type', function() {
      expect(format.dataType.forceFloat(Infinity)).to.equal(0);
      expect(format.dataType.forceFloat(NaN)).to.equal(0);
      expect(format.dataType.forceFloat(undefined)).to.equal(0);
      expect(format.dataType.forceFloat(null)).to.equal(0);
      expect(format.dataType.forceFloat({})).to.equal(0);
      expect(format.dataType.forceFloat([])).to.equal(0);
    });
  });

  describe('#forceZeroOrPositiveFloat', function() {
    it('should handle string', function() {
      expect(format.dataType.forceZeroOrPositiveFloat('2.5')).to.equal(2.5);
      expect(format.dataType.forceZeroOrPositiveFloat('0')).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveFloat('-2.5')).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveFloat('')).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveFloat('word')).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveFloat('Infinity')).to.equal(0);
    });

    it('should handle float', function() {
      expect(format.dataType.forceZeroOrPositiveFloat(2.5)).to.equal(2.5);
      expect(format.dataType.forceZeroOrPositiveFloat(0)).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveFloat(-2.5)).to.equal(0);
    });

    it('should handle unexpected type', function() {
      expect(format.dataType.forceZeroOrPositiveFloat(Infinity)).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveFloat(NaN)).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveFloat(undefined)).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveFloat(null)).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveFloat({})).to.equal(0);
      expect(format.dataType.forceZeroOrPositiveFloat([])).to.equal(0);
    });
  });
});
