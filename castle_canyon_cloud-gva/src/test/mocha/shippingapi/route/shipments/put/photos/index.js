/* eslint-disable no-console */

const expect = T.expect;

const constant = require('cccommon/constant');
const roleConst = constant.role;
const photoConst = constant.photo;
const helper = T.helper.shippingapi;
const fixtureContentType = 'image/jpeg';
const fixtureNameLarge = 'The Freight Yard - Donnie Nunley - dbnunley - flickr - 9662136197 - CC BY 2.0 - large.jpg';
const fixtureName = 'The Freight Yard - Donnie Nunley - dbnunley - flickr - 9662136197 - CC BY 2.0 - small.jpg';
const fixtureNameAlt = 'The Freight Yard - Donnie Nunley - dbnunley - flickr - 9662136197 - CC BY 2.0 - small - alt.jpg';
const fixtureNameRegex = /^https.*jpeg$/;

describe('photo endpoints', function() {
  it('should support size near JSON limit', async function() {
    const app = helper.getApp();
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    let token = created.token;
    const id = created.res.body.id;

    token = await helper.login(app, roleConst.name.dockWorker());
    let res = await helper.shipment.photos.upload(
      app, token, id, photoConst.type.pod(), T.fixturePath(fixtureNameLarge), fixtureContentType, T.data.photo.anyNote()
    );

    helper.expect.resStatus(res, 201);
    expect(res.body.url).to.match(fixtureNameRegex);
    expect(res.body.action).to.equal('create');

    res = await helper.shipment.photos.delete(app, token, id, photoConst.type.pod());
    helper.expect.resStatus(res, 204);
  });

  it('should support proof of delivery type', async function() {
    const app = helper.getApp();
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    let token = created.token;
    const id = created.res.body.id;

    token = await helper.login(app, roleConst.name.dockWorker());
    let note = T.data.photo.anyNote();
    let res = await helper.shipment.photos.upload(
      app, token, id, photoConst.type.pod(), T.fixturePath(fixtureName), fixtureContentType, note
    );

    helper.expect.resStatus(res, 201);
    expect(res.body.url).to.match(fixtureNameRegex);
    expect(res.body.action).to.equal('create');
    let urlFromPut = res.body.url;

    res = await helper.shipment.getById(app, token, id);
    expect(res.body.photos.proof_of_delivery.url).to.be.equalAndDefined(urlFromPut);
    expect(res.body.photos.proof_of_delivery.note).to.be.equalAndDefined(note);

    note = T.data.photo.anyNote() + ' replaced';
    res = await helper.shipment.photos.upload(
      app, token, id, photoConst.type.pod(), T.fixturePath(fixtureName), fixtureContentType, note
    );

    helper.expect.resStatus(res, 201);
    expect(res.body.url).to.match(fixtureNameRegex);
    expect(res.body.action).to.equal('replace');
    urlFromPut = res.body.url;

    await helper.expect.httpGetStatus(urlFromPut, 200);

    res = await helper.shipment.getById(app, token, id);
    expect(res.body.photos.proof_of_delivery.url).to.be.equalAndDefined(urlFromPut);
    expect(res.body.photos.proof_of_delivery.note).to.be.equalAndDefined(note);

    res = await helper.shipment.photos.delete(app, token, id, photoConst.type.pod());
    helper.expect.resStatus(res, 204);

    res = await helper.shipment.getById(app, token, id);
    expect(res.body.photos.proof_of_delivery.url).to.equal('');
    expect(res.body.photos.proof_of_delivery.note).to.equal('');

    await helper.expect.httpGetStatus(urlFromPut, 404);
  });

  it('should support documentation type', async function() {
    const app = helper.getApp();
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    let token = created.token;
    const id = created.res.body.id;

    token = await helper.login(app, roleConst.name.dockWorker());
    let note = T.data.photo.anyNote();
    let res = await helper.shipment.photos.upload(
      app, token, id, photoConst.type.doc(), T.fixturePath(fixtureName), fixtureContentType, note
    );

    helper.expect.resStatus(res, 201);
    expect(res.body.url).to.match(fixtureNameRegex);
    expect(res.body.action).to.equal('create');
    let urlFromPut = res.body.url;

    res = await helper.shipment.getById(app, token, id);
    expect(res.body.photos.documentation.url).to.be.equalAndDefined(urlFromPut);
    expect(res.body.photos.documentation.note).to.be.equalAndDefined(note);

    note = T.data.photo.anyNote() + ' replaced';
    res = await helper.shipment.photos.upload(
      app, token, id, photoConst.type.doc(), T.fixturePath(fixtureName), fixtureContentType, note
    );

    helper.expect.resStatus(res, 201);
    expect(res.body.url).to.match(fixtureNameRegex);
    expect(res.body.action).to.equal('replace');
    urlFromPut = res.body.url;

    await helper.expect.httpGetStatus(urlFromPut, 200);

    res = await helper.shipment.getById(app, token, id);
    expect(res.body.photos.documentation.url).to.be.equalAndDefined(urlFromPut);
    expect(res.body.photos.documentation.note).to.be.equalAndDefined(note);

    res = await helper.shipment.photos.delete(app, token, id, photoConst.type.doc());
    helper.expect.resStatus(res, 204);

    res = await helper.shipment.getById(app, token, id);
    expect(res.body.photos.documentation.url).to.equal('');
    expect(res.body.photos.documentation.note).to.equal('');

    await helper.expect.httpGetStatus(urlFromPut, 404);
  });

  it('should support all types at the same time', async function() {
    const app = helper.getApp();
    let created = await helper.shipment.loginAndCreateValidAs(app, roleConst.name.deskAgent());
    let token = created.token;
    const id = created.res.body.id;

    /**
     * proof of delivery
     */

    token = await helper.login(app, roleConst.name.dockWorker());
    const podNote = T.data.photo.anyNote();
    let res = await helper.shipment.photos.upload(
      app, token, id, photoConst.type.pod(), T.fixturePath(fixtureName), fixtureContentType, podNote
    );

    helper.expect.resStatus(res, 201);
    expect(res.body.url).to.match(fixtureNameRegex);
    expect(res.body.action).to.equal('create');
    const podUrlFromPut = res.body.url;

    /**
     * documentation
     */

    token = await helper.login(app, roleConst.name.dockWorker());
    const docNote = T.data.photo.anyNote();
    res = await helper.shipment.photos.upload(
      app, token, id, photoConst.type.doc(), T.fixturePath(fixtureNameAlt), fixtureContentType, docNote
    );

    helper.expect.resStatus(res, 201);
    expect(res.body.url).to.match(fixtureNameRegex);
    expect(res.body.action).to.equal('create');
    const docUrlFromPut = res.body.url;

    /**
     * verify uploads
     */

    res = await helper.shipment.getById(app, token, id);

    expect(res.body.photos.proof_of_delivery.url).to.be.equalAndDefined(podUrlFromPut);
    expect(res.body.photos.proof_of_delivery.note).to.be.equalAndDefined(podNote);
    await helper.expect.httpGetStatus(podUrlFromPut, 200);

    expect(res.body.photos.documentation.url).to.be.equalAndDefined(docUrlFromPut);
    expect(res.body.photos.documentation.note).to.be.equalAndDefined(docNote);
    await helper.expect.httpGetStatus(docUrlFromPut, 200);

    /**
     * delete both
     */
    res = await helper.shipment.photos.delete(app, token, id, photoConst.type.pod());
    helper.expect.resStatus(res, 204);
    res = await helper.shipment.getById(app, token, id);
    helper.expect.resStatus(res, 200);
    expect(res.body.photos.proof_of_delivery.url).to.equal('');
    expect(res.body.photos.proof_of_delivery.note).to.equal('');
    await helper.expect.httpGetStatus(podUrlFromPut, 404);

    res = await helper.shipment.photos.delete(app, token, id, photoConst.type.doc());
    helper.expect.resStatus(res, 204);
    res = await helper.shipment.getById(app, token, id);
    helper.expect.resStatus(res, 200);
    res = await helper.shipment.getById(app, token, id);
    expect(res.body.photos.documentation.url).to.equal('');
    expect(res.body.photos.documentation.note).to.equal('');
    await helper.expect.httpGetStatus(docUrlFromPut, 404);
  });
});
