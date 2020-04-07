const superagent = require('superagent');
const request = require('supertest');
const constant = require('cccommon/constant');
const roleConst = constant.role;
const statusConst = constant.status;
const shipDal = require('cccommon/dal/shipment');

exports.ROOT_DIR = () => {
  return T.ROOT_DIR + '/shippingapi';
};

exports.getApp = () => {
  const app = require('express')();
  const httpModule = require(exports.ROOT_DIR() + '/http');
  const httpConfig = httpModule.getConfig();
  httpModule.configureApp(app, httpConfig);
  return app;
};

/**
 * @param {string} subPath E.g. '/shipments', leading slash required.
 */
exports.getRouteModule = (method, subPath) => {
  return require(exports.ROOT_DIR() + `/route${subPath}/${method}`);
};

exports.contentTypeJson = () => {
  return ['Content-Type', /json/];
};

exports.tokenHeader = (token) => {
  return ['Authorization', 'OAuth ' + token];
};

exports.expect = {};

exports.expect.resStatus = (res, code) => {
  if (code === res.status) {
    return;
  }
  const debugObj = {
    headers: res.headers,
    status: res.status,
    body: res.body,
    stack: new Error().stack
  };
  T.expect(res.status).to.equal(code, '\n\n' + JSON.stringify(debugObj, null, 2) + '\n\n');
};

exports.expect.httpGetStatus = async (url, status) => {
  const expect = T.expect;
  let res;

  try {
    res = await superagent.get(url);
    exports.expect.resStatus(res, status);
  } catch (err) {
    expect(err.status).to.be.equalAndDefined(status);
  }
};

exports.expect.notAuthorized = async (app, token, method, path) => {
  const expect = T.expect;

  const res = await request(app)[method](path)
    .set(...exports.tokenHeader(token))
    .expect(...exports.contentTypeJson())
    .expect(401);

  expect(res.body).to.be.a('object');
  expect(res.body.code).to.be.equal('unauthorized');

  return res;
};

exports.expect.forbidden = async (app, token, method, path) => {
  const expect = T.expect;

  const res = await request(app)[method](path)
    .set(...exports.tokenHeader(token))
    .expect(...exports.contentTypeJson())
    .expect(403);

  expect(res.body).to.be.a('object');
  expect(res.body.code).to.be.equal('forbidden');

  return res;
};

exports.login = async (app, roleName) => {
  const expect = T.expect;

  const devUser = T.data.user.getDevUser(roleName);
  const username = devUser.username();

  let token;

  let res = await request(app).post('/session')
    .send({username: username, password: devUser.password()})
    .expect(...exports.contentTypeJson())
    .expect(201);

  expect(res).to.be.a('object');
  expect(res.body.token).to.be.a('string');
  expect(res.body.token).to.have.lengthOf.at.least(80);

  token = res.body.token;

  res = await request(app).get('/session')
    .set(...exports.tokenHeader(token))
    .expect(...exports.contentTypeJson())
    .expect(200);

  expect(res).to.be.a('object');
  expect(res.body.username).to.be.equalAndDefined(username);

  return token;
};

exports.shipment = {};

exports.shipment.create = (app, token, spec) => {
  return request(app).post('/shipments')
    .set(...exports.tokenHeader(token))
    .send(spec)
    .expect(...exports.contentTypeJson());
};

exports.shipment.loginAndCreateAs = async (app, roleName, spec) => {
  const token = await exports.login(app, roleName);
  return {
    res: await exports.shipment.create(app, token, spec),
    token: token
  };
};

exports.shipment.loginAndCreateValidAs = async (app, roleName) => {
  const spec = T.data.reqBody.shipments.validPost();
  const ret = await exports.shipment.loginAndCreateAs(app, roleName, spec);
  ret.spec = spec;
  return ret;
};

exports.shipment.list = (app, token, query) => {
  let req = request(app).get('/shipments');

  if (query) {
    req = req.query(query);
  }

  return req
    .set(...exports.tokenHeader(token))
    .expect(...exports.contentTypeJson());
};

exports.shipment.getById = (app, token, id) => {
  T.expect(id).to.exist;
  return request(app).get(`/shipments/${id}`)
    .set(...exports.tokenHeader(token))
    .expect(...exports.contentTypeJson());
};

exports.shipment.provision = (app, token, id) => {
  return request(app).put(`/shipments/${id}/provision`)
    .set(...exports.tokenHeader(token));
};

exports.shipment.provision.reset = (app, token, id) => {
  return request(app).put(`/shipments/${id}/provision/reset`)
    .set(...exports.tokenHeader(token));
};

exports.shipment.monitor = (app, token, id, spec) => {
  return request(app).put(`/shipments/${id}/monitor`)
    .send(spec)
    .set(...exports.tokenHeader(token));
};

exports.shipment.monitor.config = (app, token, id, spec) => {
  return request(app).put(`/shipments/${id}/monitor/config`)
    .send(spec)
    .set(...exports.tokenHeader(token));
};

/**
 * @param {object} expected E.g. top-level fields from POST /shipments request
 * @param {object} actual E.g. top-level fields from GET /shipments/:id response
 */
exports.shipment.expectTopLevelFieldsToEqual = (expected, actual) => {
  const expect = T.expect;

  expect(Object.keys(actual)).to.be.equalArray([
    'customerAddress',
    'customerEmail',
    'customerName',
    'deliveryAddress',
    'earliestPickup',
    'gateways',
    'gw2CloudReportingTime',
    'id',
    'latestDelivery',
    'photos',
    'pickupAddress',
    'referenceId',
    'shipmentId',
    'shipmentName',
    'shipmentNote',
    'shippingUnitCount',
    'status',
    'statusLockUser',
    'tag2GwReportingTime',
    'telemetry',
    'uShipmentId'
  ]);

  expect(actual.id).to.be.a('number');
  expect(actual.id).to.be.above(0);

  expect(actual.status).to.be.oneOf(constant.status.all());
  expect(actual.shipmentId).to.be.equalAndDefined(expected.shipmentId);
  expect(actual.uShipmentId).to.be.equalAndDefined(expected.uShipmentId);
  expect(actual.shipmentName).to.be.equalAndDefined(expected.shipmentName);
  expect(actual.shipmentNote).to.be.equalAndDefined(expected.shipmentNote);
  expect(actual.referenceId).to.be.equalAndDefined(expected.referenceId);
  expect(actual.shippingUnitCount).to.be.equalAndDefined(expected.shippingUnitCount);
  expect(actual.customerName).to.be.equalAndDefined(expected.customerName);
  expect(actual.customerName).to.be.equalAndDefined(expected.customerName);
  expect(actual.customerEmail).to.be.equalAndDefined(expected.customerEmail);
  expect(actual.earliestPickup).to.be.equalAndDefined(expected.earliestPickup);
  expect(actual.latestDelivery).to.be.equalAndDefined(expected.latestDelivery);

  expect(actual.customerAddress).to.be.deepEqualAndDefined(expected.customerAddress);
  expect(actual.pickupAddress).to.be.deepEqualAndDefined(expected.pickupAddress);
  expect(actual.deliveryAddress).to.be.deepEqualAndDefined(expected.deliveryAddress);

  expect(actual.tag2GwReportingTime).to.be.deepEqualAndDefined(expected.tag2GwReportingTime);
  expect(actual.gw2CloudReportingTime).to.be.deepEqualAndDefined(expected.gw2CloudReportingTime);
};

/**
 * @param {array} createSpec gateways array from POST /shipments request
 * @param {array} actualGateways gateways array from GET /shipments/:id response
 * @param {array} expectedGateways E.g. gateways array from PUT /shipments/:id/monitor request
 */
exports.shipment.expectGatewaysToEqual = (expectedGateways, actualGateways) => {
  const expect = T.expect;

  /* T.dump({
    expectedGateways: expectedGateways,
    actualGateways: actualGateways
  }, 'expectGatewaysToEqual'); */

  expect(expectedGateways.length).to.be.above(0);
  expect(actualGateways.length).to.be.equalAndDefined(expectedGateways.length);

  actualGateways.forEach((actual, g) => {
    const expected = expectedGateways[g];

    if (expected.id) {
      expect(actual.id).to.be.equalAndDefined(expected.id);
    }

    if (expected.wsnId) {
      expect(actual.wsnId).to.be.equalAndDefined(expected.wsnId);
    }
    if (expected.panId) {
      expect(actual.panId).to.be.equalAndDefined(expected.panId);
    }
    if (expected.channelId) {
      expect(actual.channelId).to.be.equalAndDefined(expected.channelId);
    }

    expect(expected.shippingUnits).to.be.an('array');
    expect(actual.shippingUnits).to.be.an('array');
    expect(actual.shippingUnits.length).to.be.equalAndDefined(expected.shippingUnits.length);

    actual.shippingUnits.forEach((actualShippingUnit, su) => {
      const expectedShippingUnit = expected.shippingUnits[su];

      if (expectedShippingUnit.id) {
        expect(actualShippingUnit.packageId).to.be.equalAndDefined(expectedShippingUnit.id);
      }

      expect(expectedShippingUnit.tags).to.be.an('array');
      expect(actualShippingUnit.tags).to.be.an('array');
      expect(actualShippingUnit.tags.length).to.be.equalAndDefined(expectedShippingUnit.tags.length);

      actualShippingUnit.tags.forEach((actualTag, t) => {
        const expectedTag = expected.shippingUnits[su].tags[t];

        if (expectedTag.id) {
          expect(actualTag.id).to.be.equalAndDefined(expectedTag.id);
        }
        if (expectedTag.wsnId) {
          expect(actualTag.wsnId).to.equal(expectedTag.wsnId);
        }

        if (expectedTag.thresholds) {
          expect(actualTag.thresholds).to.be.deepEqualAndDefined(expectedTag.thresholds);
        }
      });
    });
  });
};

/**
 * @param {object} expected E.g. POST /shipments request body
 * @param {object} actual E.g. GET /shipments/:id response
 */
exports.shipment.expectShippingUnitCount = (expected, actual) => {
  const expect = T.expect;
  let shippingUnitCount = 0;

  actual.gateways.forEach(actualGateway => {
    actualGateway.shippingUnits.forEach(() => {
      shippingUnitCount++;
    });
  });

  expect(shippingUnitCount).to.be.equalAndDefined(expected.shippingUnitCount);
};

/**
 * @param {object} expected E.g. POST /shipments request body
 * @param {object} actual E.g. GET /shipments/:id response
 */
exports.shipment.expectCreateSpecToEqual = (expected, actual) => {
  exports.shipment.expectTopLevelFieldsToEqual(expected, actual);

  // DECEMBER HACK
  exports.shipment.expectShippingUnitCount(expected, actual);

  exports.shipment.expectGatewaysToEqual(expected.gateways, actual.gateways);
};

/**
 * @param {array} createSpec E.g. POST /shipments request body
 * @param {array} expected E.g. PUT /shipments/:id/monitor request body
 */
exports.shipment.expectUpdated = (expected, actual) => {
  exports.shipment.expectTopLevelFieldsToEqual(expected, actual);
  exports.shipment.expectGatewaysToEqual(expected.gateways, actual.gateways);
};

/**
 * @param {array} shipment E.g. GET /shipments/:id response body
 * @param {object} deltaOptions
 * - {object} merge Full/partial shipment object to merge in.
 */
exports.shipment.buildExpected = (shipment, deltaOptions) => {
  deltaOptions = deltaOptions || {};

  let built = T.deepCopy(shipment);

  if (deltaOptions.merge) {
    built = T.deepMerge(built, deltaOptions.merge);
    if (deltaOptions.merge.gateways) {
      built.gateways = T.deepCopy(deltaOptions.merge.gateways);
    }

    /**
     * DECEMBER HACK: there's no reliable way to merge gateway arrays unless all elements from both arrays
     * contain 'id' fields that allow us to know the mappings. Position in the arrays is insufficient.
     * And because buildExpected may be used in scenarios before gateway 'id' values are known, i.e. any time
     * before PUT /shipments/:id/monitor when the GVA first receives those (UUID) values, we need to handle
     * the cases when the mapping isn't possible.
     *
     * Until there's mechanism for mapping array elements in all use cases, we will manually add the top-level
     * gateway fields if they exist in the one gateway element expected for December.
     */
    if (shipment.gateways[0].wsnId) {
      built.gateways[0].wsnId = shipment.gateways[0].wsnId;
    }
    if (shipment.gateways[0].panId) {
      built.gateways[0].panId = shipment.gateways[0].panId;
    }
    if (shipment.gateways[0].channelId) {
      built.gateways[0].channelId = shipment.gateways[0].channelId;
    }
  }

  return built;
};

exports.shipment.expectStatusConflict = (res, currentStatus, requiredStatus) => {
  const expect = T.expect;
  exports.expect.resStatus(res, 409);
  expect(res.body.code).to.equal('status_conflict');
  expect(res.body.details.currentStatus).to.be.equalAndDefined(currentStatus);
  expect(res.body.details.requiredStatus).to.be.equalAndDefined(requiredStatus);
};

exports.shipment.expectInputValidationFailed = (res) => {
  const expect = T.expect;
  exports.expect.resStatus(res, 400);
  expect(res.body.code).to.be.equal('input_validation_failed');
  expect(res.body.message).to.be.equal('One or more input fields was not accepted.');
};

exports.shipment.expectStatusTransInvalid = (res, currentStatus) => {
  const expect = T.expect;
  exports.expect.resStatus(res, 409);
  expect(res.body.code).to.equal('status_transition_invalid');
  expect(res.body.details.currentStatus).to.be.equalAndDefined(currentStatus);
};

exports.shipment.expectStatusAndLocked = (res, status, roleName) => {
  const expect = T.expect;
  expect(res.body.status).to.be.equalAndDefined(status);
  expect(res.body.statusLockUser).to.be.equalAndDefined(T.data.user.getDevUser(roleName).username());
};

exports.shipment.expectStatusAndUnlocked = (res, status) => {
  const expect = T.expect;
  expect(res.body.status).to.be.equalAndDefined(status);
  expect(res.body.statusLockUser).to.be.equalAndDefined('');
};

exports.shipment.expectForbiddenStatusTrans = (res, roleName) => {
  const expect = T.expect;

  exports.expect.resStatus(res, 403);
  expect(res.body.code).to.be.equal('status_transition_forbidden');
  expect(res.body.message).to.be.equal('Shipment status is locked by another user');
  expect(res.body.details.lockOwner).to.be.equalAndDefined(T.data.user.getDevUser(roleName).username());
};

exports.shipment.expectForbiddenRole = (res, expectedRoleName, actualRoleName) => {
  const expect = T.expect;

  exports.expect.resStatus(res, 403);
  expect(res.body.message).to.be.equalAndDefined(constant.errMsg.notRoleMember());
  expect(res.body.details).to.be.deepEqualAndDefined({
    memberOf: [actualRoleName],
    requireMembershipInOneOf: [expectedRoleName]
  });
};

/**
 * Return the merge of two gateway arrays.
 *
 * Merge them "right-to-left" where b's value will overwrite a's when they cannot be combined.
 *
 * @param {array} a E.g. from GET /shipments/:id response
 * @param {array} b E.g. from GET /shipments/:id response
 * @return {array}
 */
exports.shipment.mergeGateways = (a, b) => {
  const expect = T.expect;

  expect(a).to.be.an('array');
  expect(b).to.be.an('array');
  expect(a).to.have.a.lengthOf.at.least(1);
  expect(a.length).to.be.equalAndDefined(b.length);

  // Target objects from 'a' that will be merged into.
  const gatewaysById = {a: {}, b: {}};
  const shippingUnitsById = {a: {}, b: {}};
  const tagsById = {a: {}, b: {}};

  a.forEach((aGateway, g) => {
    const bGateway = b[g];

    gatewaysById.a[aGateway.id] = aGateway;
    gatewaysById.b[bGateway.id] = bGateway;

    aGateway.shippingUnits.forEach((aShippingUnit, su) => {
      const bShippingUnit = bGateway.shippingUnits[su];

      shippingUnitsById.a[aShippingUnit.id] = aShippingUnit;
      shippingUnitsById.b[bShippingUnit.id] = bShippingUnit;

      aShippingUnit.tags.forEach((aTag, t) => {
        const bTag = bShippingUnit.tags[t];

        tagsById.a[aTag.id] = aTag;
        tagsById.b[bTag.id] = bTag;
      });
    });
  });

  /* T.dump({
    gatewaysById: gatewaysById,
    shippingUnitsById: shippingUnitsById,
    tagsById: tagsById
  }, 'mergeGateways'); */

  expect(Object.keys(gatewaysById.a).length).to.be.equalAndDefined(Object.keys(gatewaysById.b).length);
  expect(Object.keys(shippingUnitsById.a).length).to.be.equalAndDefined(Object.keys(shippingUnitsById.b).length);
  expect(Object.keys(tagsById.a).length).to.be.equalAndDefined(Object.keys(tagsById.b).length);

  const c = [];

  Object.keys(gatewaysById.a).forEach(gatewayId => {
    const aGateway = gatewaysById.a[gatewayId];
    const bGateway = gatewaysById.b[gatewayId];

    const cGateway = T.deepMerge(aGateway, bGateway);
    cGateway.shippingUnits = [];

    aGateway.shippingUnits.forEach(aShippingUnit => {
      const bShippingUnit = shippingUnitsById.b[aShippingUnit.id];

      const cShippingUnit = T.deepMerge(aShippingUnit, bShippingUnit);
      cShippingUnit.tags = [];

      aShippingUnit.tags.forEach(aTag => {
        const bTag = tagsById.b[aTag.id];

        const cTag = T.deepMerge(aTag, bTag);
        cTag.thresholds = T.deepMerge(aTag.thresholds || {}, bTag.thresholds || {});

        cShippingUnit.tags.push(cTag);
      });

      cGateway.shippingUnits.push(cShippingUnit);
    });

    c.push(cGateway);
  });

  return c;
};

exports.shipment.shipResBodyToMonitorConfigPutReqBody = (ship) => {
  const body = {
    tag2GwReportingTime: T.data.shipment.anyTag2GwReportingTime() + 3,
    gw2CloudReportingTime: T.data.shipment.anyGw2CloudReporingTime() + 3,
    gateways: [{id: ship.gateways[0].id, shippingUnits: []}]
  };

  ship.gateways[0].shippingUnits.forEach(shippingUnit => {
    const finalShippingUnit = {id: shippingUnit.packageId, tags: []};

    shippingUnit.tags.forEach(tag => {
      finalShippingUnit.tags.push({
        id: tag.id,
        thresholds: {
          temperature: {
            min: T.data.tag.anyTemperatureMin() + 3,
            max: T.data.tag.anyTemperatureMax() + 3
          },
          humidity: {
            min: T.data.tag.anyHumidityMin() + 3,
            max: T.data.tag.anyHumidityMax() + 3
          },
          light: {
            min: T.data.tag.anyLightMin() + 3,
            max: T.data.tag.anyLightMax() + 3
          },
          pressure: {
            min: T.data.tag.anyPressureMin() + 3,
            max: T.data.tag.anyPressureMax() + 3
          },
          tilt: {
            max: T.data.tag.anyTiltMax() + 3
          },
          shock: {
            max: T.data.tag.anyShockMax() + 3
          },
          battery: {
            min: T.data.tag.anyBatteryMin() + 3
          }
        }
      });
    });

    body.gateways[0].shippingUnits.push(finalShippingUnit);
  });

  return body;
};

exports.shipment.zeroValueThresholdMonitorConfigPutReqBody = (ship) => {
  const body = {
    tag2GwReportingTime: T.data.shipment.anyTag2GwReportingTime() + 3,
    gw2CloudReportingTime: T.data.shipment.anyGw2CloudReporingTime() + 3,
    gateways: [{id: ship.gateways[0].id, shippingUnits: []}]
  };

  ship.gateways[0].shippingUnits.forEach(shippingUnit => {
    const finalShippingUnit = {id: shippingUnit.packageId, tags: []};

    shippingUnit.tags.forEach(tag => {
      finalShippingUnit.tags.push({
        id: tag.id,
        thresholds: T.data.reqBody.shipments.zeroValuePostTag().thresholds
      });
    });

    body.gateways[0].shippingUnits.push(finalShippingUnit);
  });

  return body;
};

exports.shipment.negValueThresholdMonitorConfigPutReqBody = (ship) => {
  const body = {
    tag2GwReportingTime: T.data.shipment.anyTag2GwReportingTime() + 3,
    gw2CloudReportingTime: T.data.shipment.anyGw2CloudReporingTime() + 3,
    gateways: [{id: ship.gateways[0].id, shippingUnits: []}]
  };

  ship.gateways[0].shippingUnits.forEach(shippingUnit => {
    const finalShippingUnit = {id: shippingUnit.packageId, tags: []};

    shippingUnit.tags.forEach(tag => {
      finalShippingUnit.tags.push({
        id: tag.id,
        thresholds: T.data.reqBody.shipments.negValuePostTag().thresholds
      });
    });

    body.gateways[0].shippingUnits.push(finalShippingUnit);
  });

  return body;
};

exports.shipment.receive = (app, token, id) => {
  return request(app).put(`/shipments/${id}/receive`)
    .set(...exports.tokenHeader(token));
};

exports.shipment.receive.reset = (app, token, id) => {
  return request(app).put(`/shipments/${id}/receive/reset`)
    .set(...exports.tokenHeader(token));
};

exports.shipment.receive.accept = (app, token, id) => {
  return request(app).put(`/shipments/${id}/receive/accept`)
    .set(...exports.tokenHeader(token));
};

exports.shipment.receive.reject = (app, token, id) => {
  return request(app).put(`/shipments/${id}/receive/reject`)
    .set(...exports.tokenHeader(token));
};

exports.shipment.receive.deinstrument = (app, token, id) => {
  return request(app).put(`/shipments/${id}/receive/deinstrument`)
    .set(...exports.tokenHeader(token));
};

exports.shipment.end = (app, token, id) => {
  return request(app).put(`/shipments/${id}/end`)
    .set(...exports.tokenHeader(token));
};

exports.shipment.photos = {};

exports.shipment.photos.upload = async (app, token, id, photoType, localPath, contentType, note) => {
  const fileData = await T.readFile(localPath);
  return request(app).put(`/shipments/${id}/photos/${photoType}`)
    .send({
      data: new Buffer(fileData).toString('base64'),
      contentType: contentType,
      note: note
    })
    .set(...exports.tokenHeader(token))
    .expect(...exports.contentTypeJson());
};

exports.shipment.photos.delete = async (app, token, id, photoType) => {
  return request(app).delete(`/shipments/${id}/photos/${photoType}`)
    .set(...exports.tokenHeader(token));
};

exports.shipment.deleteOne = (app, token, id) => {
  return request(app).delete(`/shipments/${id}`)
    .set(...exports.tokenHeader(token));
};

exports.shipment.deleteAll = (app, token) => {
  return request(app).delete('/shipments')
    .set(...exports.tokenHeader(token));
};

exports.shipment.createAccepteDeinstrumented = async (app) => {
  const successStatus = 204;
  let token;
  let res;

  /**
   * STEP: create a shipment as a desk agent
   */
  let created = await exports.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
  token = created.token;
  const id = created.res.body.id;

  const dalFindRes = await shipDal.findByPrimaryKey(id);

  token = await exports.login(app, roleConst.name.dockWorker());

  res = await exports.shipment.provision(app, token, id);
  exports.expect.resStatus(res, successStatus);

  res = await exports.shipment.monitor(app, token, id, T.data.monitor.validPut());
  exports.expect.resStatus(res, successStatus);

  res = await exports.shipment.receive(app, token, id);
  exports.expect.resStatus(res, successStatus);

  res = await exports.shipment.receive.accept(app, token, id);
  exports.expect.resStatus(res, successStatus);

  token = await exports.login(app, roleConst.name.dockWorker());
  res = await exports.shipment.receive.deinstrument(app, token, id);
  exports.expect.resStatus(res, successStatus);

  res = await exports.shipment.getById(app, token, id);
  exports.shipment.expectStatusAndUnlocked(res, statusConst.acceptedDeinstrumented());

  return {
    created: created,
    dalFindRes: dalFindRes,
    id: id,
    res: res
  };
};
