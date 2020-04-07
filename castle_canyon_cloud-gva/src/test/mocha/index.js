const fs = require('fs');
const path = require('path');

const deepmerge = require('deepmerge');
const eyes = require('eyes');

const chai = require('chai');
const Assertion = chai.Assertion;

// Provide a safer alternative to `to.equal` in the event that both the expected and actual
// objects do not have the property-under-test for some reason (e.g. typo).
Assertion.addMethod('equalAndDefined', function(n) {
  new Assertion(this._obj).to.exist;
  new Assertion(this._obj).to.equal(n);
});

// Provide a safer alternative to `to.deep.equal` in the event that both the expected and actual
// objects do not have the property-under-test for some reason (e.g. typo).
Assertion.addMethod('deepEqualAndDefined', function(n) {
  new Assertion(this._obj).to.exist;
  new Assertion(this._obj).to.deep.equal(n);
});

Assertion.addMethod('equalArray', function(n) {
  new Assertion(this._obj).to.exist;

  let thisObjCopy = Array.from(this._obj);
  let nCopy = Array.from(n);

  thisObjCopy.sort();
  nCopy.sort();

  new Assertion(thisObjCopy).to.deep.equal(nCopy);
});

// Populate the (global) T object with test dependencies.
// - Allow them to access dependencies at stable/universal keys while the underlying
//   locations (e.g. that would cause changes to require paths) may change.
const T = {};

// Assist with require().
T.ROOT_DIR = path.resolve(path.join(__dirname, path.sep, '..', path.sep, '..'));

T.chai = chai;
T.expect = T.chai.expect;
T.dal = require('cccommon/dal');
T.models = {
  internaldb: require('cccommon/models/internaldb')
};
T.data = require('./data');

// Module-specific test helper libs/constant/etc.
T.helper = {
  shippingapi: require('./shippingapi')
};

T.dump = eyes.inspector({maxLength: 20000});
T.dumpStr = eyes.inspector({stream: null, maxLength: 20000});
T.deepMerge = (...args) => {
  return deepmerge.all(args);
};
T.deepCopy = (src) => {
  return deepmerge({}, src);
};

/**
 * Return a Promise for fs.readFile.
 *
 * @author https://stackoverflow.com/questions/41203409/reading-file-with-es6-promises
 */
T.readFile = (fileName, options) => {
  return new Promise(function(resolve, reject){
    fs.readFile(fileName, options, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

T.fixturePath = (relPath) => {
  return `${__dirname}/data/fixture/${relPath}`;
};

global.T = T;
