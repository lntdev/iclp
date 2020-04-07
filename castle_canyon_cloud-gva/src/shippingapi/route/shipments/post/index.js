const Logging = require('cccommon/logging').logger('shippingapi.route.shipment.post');
Logging.enable();

const moment = require('moment');

const shipDal = require('cccommon/dal/shipment');
const appErr = require('this_pkg/error');
const uuid = require('uuid/v4');
const idgen = require('cccommon/idgen');
const format = require('cccommon/format');
const ValidationError = require('cccommon/dal').error.ValidationError;
const deepmerge = require('deepmerge');
const hooks = require('this_pkg/hooks');

// Temporary: just keep track of prior random IDs instead of in a DB table.
let lastGwWsnId, lastGwPanId;

exports.handler = async (req, res, user) => {
  const successStatus = 201;
  let shipment;
  let username;

  try {
    username = user.email;

    let spec = req.body;

    const valErrs = exports.validateSpec(spec);
    if (valErrs.length) {
      appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
      return;
    }

    spec = exports.finalizeSpec(spec);

    shipment = await shipDal.create(spec);
  } catch(createErr) {
    if (createErr instanceof ValidationError) {
      exports.handleDbValidationError(req, res, createErr);
    } else {
      appErr.handleRouteServerErr(req, res, createErr, Logging, 'failed to create shipment');
    }
    return;
  }

  Logging.msg('shipment created', {
    requestId: req.id,
    username: username,
    shipmentPrimaryKeyId: shipment.id
  });

  //call shipment create hook
  hooks.shipment.create(shipment.id, shipment.shipmentName);

  res.status(successStatus).send({id: shipment.id});
};

exports.handler.init = () => { // Allow unit tests to assume initialized handler modules.
  lastGwWsnId = undefined;
  lastGwPanId = undefined;
};

exports.handleDbValidationError = (req, res, err) => {
  try {
    const valErrs = [];
    err.errors.forEach(item => {
      const valErr = {};
      valErr[item.path] = `${item.message} (${item.path} = [${item.value}])`;
      valErrs.push(valErr);
    });
    appErr.send(req, res, 'input_validation_failed', appErr.mergeValErrList(valErrs));
  } catch(validationLogicErr) {
    appErr.handleRouteServerErr(req, res, validationLogicErr, Logging, 'failed to create shipment');
  }
};

exports.finalizeSpec = (spec) => {
  const finalSpec = {};

  finalSpec.status = 'new';

  finalSpec.shipmentId = spec.shipmentId;
  finalSpec.uShipmentId = spec.uShipmentId;
  finalSpec.shipmentName = spec.shipmentName;
  finalSpec.shippingUnitCount = spec.shippingUnitCount;
  finalSpec.referenceId = spec.referenceId || '';
  finalSpec.shipmentNote = spec.shipmentNote || '';
  finalSpec.customerName = spec.customerName;
  finalSpec.customerEmail = spec.customerEmail;

  finalSpec.customerAddrLine1 = spec.customerAddress.line1;
  finalSpec.customerAddrCity = spec.customerAddress.city;
  finalSpec.customerAddrState = spec.customerAddress.state;
  finalSpec.customerAddrPin = spec.customerAddress.pin;
  finalSpec.customerAddrCountry = spec.customerAddress.country;
  finalSpec.customerAddrPhone = spec.customerAddress.phone;

  finalSpec.recipientName = spec.recipientName;

  finalSpec.earliestPickup = spec.earliestPickup;
  finalSpec.latestDelivery = spec.latestDelivery;
  finalSpec.tag2GwReportingTime = spec.tag2GwReportingTime;
  finalSpec.gw2CloudReportingTime = spec.gw2CloudReportingTime;
  finalSpec.surfaceOnly = spec.surfaceOnly;

  finalSpec.legs = [
    {
      order: 1,

      // In a future iteration, these should be represented by distinct Address entities
      // or similar. See comments in the above address-related functions or the Leg model module.
      fromLabel: 'pickupAddress',
      fromLine1: spec.pickupAddress.line1,
      fromCity:  spec.pickupAddress.city,
      fromState: spec.pickupAddress.state,
      fromPin:  spec.pickupAddress.pin,
      fromCountry: spec.pickupAddress.country,
      fromPhone: spec.pickupAddress.phone,

      // In a future iteration, these should be represented by distinct Address entities
      // or similar. See comments in the above address-related functions or the Leg model module.
      toLabel: 'deliveryAddress',
      toLine1: spec.deliveryAddress.line1,
      toCity: spec.deliveryAddress.city,
      toState: spec.deliveryAddress.state,
      toPin: spec.deliveryAddress.pin,
      toCountry: spec.deliveryAddress.country,
      toPhone: spec.deliveryAddress.phone
    }
  ];

  let firstTag;
  let shippingUnitCount = 0;
  let lastShippingUnitSpec;
  finalSpec.shippingUnits = [];

  spec.shippingUnits.forEach((shippingUnit, su) => {
    const finalShippingUnitSpec = {
      packageId: uuid(), // Placeholder to avoid null/non-unique value until we have the real sent from OBT.
      tags: []
    };

    shippingUnitCount++;

    shippingUnit.tags.forEach((tag, t) => {
      if (su === 0 && t === 0) {
        firstTag = deepmerge({}, tag);
      }

      finalShippingUnitSpec.tags.push({
        uuid: uuid(), // Placeholder to avoid null/non-unique value until we have the real sent from OBT.
        wsnId: 0, // We will update it after receiving the value from the OBT.

        temperatureIsEnabled: firstTag.thresholds.temperature.enable,
        temperatureMin: firstTag.thresholds.temperature.min,
        temperatureMax: firstTag.thresholds.temperature.max,

        humidityIsEnabled: firstTag.thresholds.humidity.enable,
        humidityMin: firstTag.thresholds.humidity.min,
        humidityMax: firstTag.thresholds.humidity.max,

        lightIsEnabled: firstTag.thresholds.light.enable,
        lightMin: firstTag.thresholds.light.min,
        lightMax: firstTag.thresholds.light.max,

        pressureIsEnabled: firstTag.thresholds.pressure.enable,
        pressureMin: firstTag.thresholds.pressure.min,
        pressureMax: firstTag.thresholds.pressure.max,

        tiltIsEnabled: firstTag.thresholds.tilt.enable,
        tiltMax: firstTag.thresholds.tilt.max,

        shockIsEnabled: firstTag.thresholds.shock.enable,
        shockMax: firstTag.thresholds.shock.max,

        batteryIsEnabled: firstTag.thresholds.battery.enable,
        batteryMin: firstTag.thresholds.battery.min
      });
    });

    lastShippingUnitSpec = deepmerge({}, finalShippingUnitSpec);

    finalSpec.shippingUnits.push(finalShippingUnitSpec);
  });


  if (shippingUnitCount < spec.shippingUnitCount) {
    for (let su = 0; su < spec.shippingUnitCount - shippingUnitCount; su++) {
      const suCopy = deepmerge({}, lastShippingUnitSpec);
      suCopy.packageId = uuid();
      suCopy.tags.forEach((tag, t) => {
        suCopy.tags[t].uuid = uuid();
      });
      finalSpec.shippingUnits.push(suCopy);
    }
  }

  finalSpec.geofences = [];
  spec.geofences.forEach((geofence) => {
    if(geofence.enable == true) {
      var newGeofence = {};
      newGeofence = geofence;
      delete newGeofence.enable;
      newGeofence.alertStatus = false;
      finalSpec.geofences.push(newGeofence);
    }
  });
  return finalSpec;
};

exports.validateSpec = (spec) => {
  const valErrs = [];

  function present(v) {
    return v && v != '';
  }

  if (!present(spec.shipmentId)) {
    valErrs.push({shipmentId: 'missing/empty'});
  }
  if (!present(spec.uShipmentId)) {
    valErrs.push({uShipmentId: 'missing/empty'});
  }
  if (!present(spec.shipmentName)) {
    valErrs.push({shipmentName: 'missing/empty'});
  }
  if (present(spec.shippingUnitCount)) {
    spec.shippingUnitCount = format.dataType.forceInt(spec.shippingUnitCount);
    if (spec.shippingUnitCount < 1) {
      valErrs.push({shippingUnitCount: 'must be greater than 0'});
    }
  } else {
    valErrs.push({shippingUnitCount: 'missing/empty'});
  }
  if (!present(spec.customerName)) {
    valErrs.push({customerName: 'missing/empty'});
  }
  if (!present(spec.customerEmail)) {
    valErrs.push({customerEmail: 'missing/empty'});
  }

  if (!present(spec.customerAddress)) {
    valErrs.push({customerAddress: 'missing/empty'});
    return valErrs;
  }
  if (!present(spec.customerAddress.line1)) {
    valErrs.push({'customerAddress.line1': 'missing/empty'});
  }
  if (!present(spec.customerAddress.city)) {
    valErrs.push({'customerAddress.city': 'missing/empty'});
  }
  if (!present(spec.customerAddress.state)) {
    valErrs.push({'customerAddress.state': 'missing/empty'});
  }
  if (!present(spec.customerAddress.pin)) {
    valErrs.push({'customerAddress.pin': 'missing/empty'});
  }
  if (!present(spec.customerAddress.country)) {
    valErrs.push({'customerAddress.country': 'missing/empty'});
  }
  if (!present(spec.customerAddress.phone)) {
    valErrs.push({'customerAddress.phone': 'missing/empty'});
  }

  if (!present(spec.earliestPickup)) {
    valErrs.push({earliestPickup: 'missing/empty'});
  } else if (!moment(spec.earliestPickup, "YYYY-MM-DD H:mm:ss", true).isValid()) {
    valErrs.push({earliestPickup: 'invalid format, required format: YYYY-MM-DD H:mm:SS received: ' + spec.earliestPickup});
  }

  if (!present(spec.latestDelivery)) {
    valErrs.push({latestDelivery: 'missing/empty'});
  } else if (!moment(spec.latestDelivery, "YYYY-MM-DD H:mm:ss", true).isValid()) {
    valErrs.push({latestDelivery: 'invalid format, required format: YYYY-MM-DD H:mm:SS received: ' + spec.latestDelivery});
  }

  if (!present(spec.tag2GwReportingTime)) {
    valErrs.push({tag2GwReportingTime: 'missing/empty'});
  }
  if (!present(spec.gw2CloudReportingTime)) {
    valErrs.push({gw2CloudReportingTime: 'missing/empty'});
  }

  if (!present(spec.pickupAddress)) {
    valErrs.push({pickupAddress: 'missing/empty'});
    return valErrs;
  }
  if (!present(spec.pickupAddress.line1)) {
    valErrs.push({'pickupAddress.line1': 'missing/empty'});
  }
  if (!present(spec.pickupAddress.city)) {
    valErrs.push({'pickupAddress.city': 'missing/empty'});
  }
  if (!present(spec.pickupAddress.state)) {
    valErrs.push({'pickupAddress.state': 'missing/empty'});
  }
  if (!present(spec.pickupAddress.pin)) {
    valErrs.push({'pickupAddress.pin': 'missing/empty'});
  }
  if (!present(spec.pickupAddress.country)) {
    valErrs.push({'pickupAddress.country': 'missing/empty'});
  }
  if (!present(spec.pickupAddress.phone)) {
    valErrs.push({'pickupAddress.phone': 'missing/empty'});
  }

  if (!present(spec.recipientName)) {
    valErrs.push({recipientName: 'missing/empty'});
    return valErrs;
  }
  if (!present(spec.deliveryAddress)) {
    valErrs.push({deliveryAddress: 'missing/empty'});
    return valErrs;
  }
  if (!present(spec.deliveryAddress.line1)) {
    valErrs.push({'deliveryAddress.line1': 'missing/empty'});
  }
  if (!present(spec.deliveryAddress.city)) {
    valErrs.push({'deliveryAddress.city': 'missing/empty'});
  }
  if (!present(spec.deliveryAddress.state)) {
    valErrs.push({'deliveryAddress.state': 'missing/empty'});
  }
  if (!present(spec.deliveryAddress.pin)) {
    valErrs.push({'deliveryAddress.pin': 'missing/empty'});
  }
  if (!present(spec.deliveryAddress.country)) {
    valErrs.push({'deliveryAddress.country': 'missing/empty'});
  }
  if (!present(spec.deliveryAddress.phone)) {
    valErrs.push({'deliveryAddress.phone': 'missing/empty'});
  }
  if (!spec.hasOwnProperty('surfaceOnly')) {
    valErrs.push({'surfaceOnly': 'missing/empty'});
  }

  if (!Array.isArray(spec.shippingUnits) || spec.shippingUnits.length === 0) {
    valErrs.push({'shippingUnits': 'missing/empty'});
    return valErrs;
  }

  if (!Array.isArray(spec.shippingUnits[0].tags) || spec.shippingUnits[0].tags.length === 0) {
    valErrs.push({'shippingUnits[0].tags': 'missing/empty'});
    return valErrs;
  }

  if (!spec.shippingUnits[0].tags[0].thresholds) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds': 'missing/empty'});
    return valErrs;
  }

  if (!spec.shippingUnits[0].tags[0].thresholds.temperature) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.temperature': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.temperature.min) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.temperature.min': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.temperature.max) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.temperature.max': 'missing/empty'});
    return valErrs;
  }

  if (!spec.shippingUnits[0].tags[0].thresholds.humidity) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.humidity': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.humidity.min) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.humidity': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.humidity.max) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.humidity.max': 'missing/empty'});
    return valErrs;
  }

  if (!spec.shippingUnits[0].tags[0].thresholds.light) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.light': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.light.min) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.light.min': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.light.max) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.light.max': 'missing/empty'});
    return valErrs;
  }

  if (!spec.shippingUnits[0].tags[0].thresholds.pressure) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.pressure': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.pressure.min) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.pressure.min': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.pressure.max) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.pressure.max': 'missing/empty'});
    return valErrs;
  }

  if (!spec.shippingUnits[0].tags[0].thresholds.tilt) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.tilt': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.tilt.max) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.tilt.max': 'missing/empty'});
    return valErrs;
  }

  if (!spec.shippingUnits[0].tags[0].thresholds.shock) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.shock': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.shock.max) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.shock.max': 'missing/empty'});
    return valErrs;
  }

  if (!spec.shippingUnits[0].tags[0].thresholds.battery) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.battery': 'missing/empty'});
    return valErrs;
  }
  if ('' === spec.shippingUnits[0].tags[0].thresholds.battery.min) {
    valErrs.push({'shippingUnits[0].tags[0].thresholds.battery.min': 'missing/empty'});
    return valErrs;
  }
  /* Geofence parameters validation */
  if(!Array.isArray(spec.geofences)){
    valErrs.push({geofences: 'missing or should be of type Array'});
    return valErrs;
  }
  spec.geofences.forEach((geofence, i) => {
    if (geofence.enable == true){
      if(!Array.isArray(geofence.coordinates)){
        valErrs.push({'geofence.coordinates': 'missing or should be of type Array'});
      }
      if(!Array.isArray(geofence.breachAction)){
        valErrs.push({'geofence.breachAction': 'missing or should be of type Array'});
      }
      if(!geofence.type){
        valErrs.push({'geofence.type': 'missing or empty'});
      }
      if(!geofence.shape){
        valErrs.push({'geofence.shape': 'missing or empty'});
      } else if(geofence.shape == 'circle') {
        if(!geofence.coordinates[0].radius){
          valErrs.push({'geofence.coordinates': 'radius parameter is missing'});
        }
      } else{
        valErrs.push({'geofence.shape': 'only circle shape is supported'});
      }
    }
  });
  return valErrs;
};
