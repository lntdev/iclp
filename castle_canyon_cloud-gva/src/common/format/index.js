/* logging ..*/
const Logging = require('cccommon/logging').logger("common-format");
Logging.enable();

const util = require('util');

exports.datetime = {};

// https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime/11150727#11150727
exports.datetime.toMysql = (date) => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.getUTCFullYear() + '-' +
    ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
    ('00' + date.getUTCDate()).slice(-2) + ' ' +
    ('00' + date.getUTCHours()).slice(-2) + ':' +
    ('00' + date.getUTCMinutes()).slice(-2) + ':' +
    ('00' + date.getUTCSeconds()).slice(-2);
};

exports.shipment = {};
exports.shipment.modelToJson = (ship) => {
  ship = ship.toJSON();

  const formatted = {
    id: ship.id,
    status: ship.status,
    shipmentId: ship.shipmentId,
    uShipmentId: ship.uShipmentId,
    shipmentName: ship.shipmentName,
    referenceId: ship.referenceId,
    shippingUnitCount: ship.shippingUnitCount,
    shipmentNote: ship.shipmentNote,
    customerName: ship.customerName,
    customerEmail: ship.customerEmail,
    customerAddress: {
      line1: ship.customerAddrLine1,
      city: ship.customerAddrCity,
      state: ship.customerAddrState,
      pin: ship.customerAddrPin,
      country: ship.customerAddrCountry,
      phone: ship.customerAddrPhone
    },
    earliestPickup: exports.datetime.toMysql(new Date(ship.earliestPickup)),
    latestDelivery: exports.datetime.toMysql(new Date(ship.latestDelivery)),
    pickupAddress: {},
    recipientName: ship.recipientName,
    deliveryAddress: {},
    tag2GwReportingTime: ship.tag2GwReportingTime,
    gw2CloudReportingTime: ship.gw2CloudReportingTime,
    surfaceOnly: ship.surfaceOnly,
    gateways: []
  };

  if (ship.statusLockUser) {
    formatted.statusLockUser = ship.statusLockUser.email;
  } else {
    formatted.statusLockUser = '';
  }

  const telemetry = {
    location: {}
  };
  if (ship.telemetryReportingTime === null || ship.telemetryReportingTime === undefined) {
    telemetry.reportingTime = null;
  } else {
    telemetry.reportingTime = exports.datetime.toMysql(ship.telemetryReportingTime);
  }
  if (ship.telemetryLatitude === null || ship.telemetryLatitude === undefined) {
    telemetry.location.latitude = null;
  } else {
    telemetry.location.latitude = ship.telemetryLatitude;
  }
  if (ship.telemetryLongitude === null || ship.telemetryLongitude === undefined) {
    telemetry.location.longitude = null;
  } else {
    telemetry.location.longitude = ship.telemetryLongitude;
  }
  formatted.telemetry = telemetry;

  formatted.photos = {
    documentation: {
      url: ship.photoDocumentationUrl,
      note: ship.photoDocumentationNote
    },
    proof_of_delivery: {
      url: ship.photoProofOfDeliveryUrl,
      note: ship.photoProofOfDeliveryNote
    }
  };

  ship.legs.forEach((leg) => {
    if (leg.fromLabel === 'pickupAddress' && leg.toLabel === 'deliveryAddress') {
      formatted.pickupAddress.line1 = leg.fromLine1;
      formatted.pickupAddress.city = leg.fromCity;
      formatted.pickupAddress.state = leg.fromState;
      formatted.pickupAddress.pin = leg.fromPin;
      formatted.pickupAddress.country = leg.fromCountry;
      formatted.pickupAddress.phone = leg.fromPhone;
      formatted.deliveryAddress.line1 = leg.toLine1;
      formatted.deliveryAddress.city = leg.toCity;
      formatted.deliveryAddress.state = leg.toState;
      formatted.deliveryAddress.pin = leg.toPin;
      formatted.deliveryAddress.country = leg.toCountry;
      formatted.deliveryAddress.phone = leg.toPhone;
    }
  });

  formatted.geofences = [];
  ship.geofences.forEach((geofence) => {
    var g = {};
    g.id = geofence.id;
    g.type = geofence.type;
    g.shape = geofence.shape;
    g.alertStatus = geofence.alertStatus;
    g.coordinates = geofence.coordinates;
    g.breachAction = geofence.breachAction;
    formatted.geofences.push(g);
  });

  formatted.shippingUnits = [];

  ship.shippingUnits.forEach((srcShippingUnit) => {
    const dstShippingUnit = {
      packageId: srcShippingUnit.packageId,
      tags: []
    };

    // Hide the package ID we set at entity creation to work around DB unique/nonNull constraint.
    // It will only be expected after the OBT sends them to us via PUT /shipments/:id/monitor.
    if (ship.status === 'new' || ship.status == 'inProvision') {
      dstShippingUnit.packageId = '';
    }

    srcShippingUnit.tags.forEach((srcTag) => {
      const dstTag = {
        id: srcTag.uuid,
        wsnId: srcTag.wsnId,
        thresholds: {
          temperature: {
            enable: srcTag.temperatureIsEnabled,
            min: srcTag.temperatureMin,
            max: srcTag.temperatureMax
          },
          humidity: {
            enable: srcTag.humidityIsEnabled,
            min: srcTag.humidityMin,
            max: srcTag.humidityMax
          },
          light: {
            enable: srcTag.lightIsEnabled,
            min: srcTag.lightMin,
            max: srcTag.lightMax
          },
          pressure: {
            enable: srcTag.pressureIsEnabled,
            min: srcTag.pressureMin,
            max: srcTag.pressureMax
          },
          tilt: {
            enable: srcTag.tiltIsEnabled,
            max: srcTag.tiltMax
          },
          shock: {
            enable: srcTag.shockIsEnabled,
            max: srcTag.shockMax
          },
          battery: {
            enable: srcTag.batteryIsEnabled,
            min: srcTag.batteryMin
          }
        }
      };

      // Hide the UUID we set at entity creation to work around DB unique/nonNull constraint.
      // It will only be expected after the OBT sends them to us via PUT /shipments/:id/monitor.
      if (ship.status === 'new' || ship.status == 'inProvision') {
        dstTag.id = '';
      }

      dstShippingUnit.tags.push(dstTag);
    });
    formatted.shippingUnits.push(dstShippingUnit);
  });

  return formatted;
};

/**
 * Pulls required sensor threshold data (and friends) out of a shipment object and returns
 * formatted with ready made PCS2 rules for a device group
 *
 * @param {object} Shipment model from Sequelize, e.g. acquired via exports.findByPrimaryKey.
 * @return {object}
 * - {array} rules
 */
exports.shipment.thresholds2Pcs2Rules = (ship, groupid) => {

  var jsonship = exports.shipment.modelToJson(ship);

  var retobject = {
    rules: []
  };

  var operators = {
    GT: "GreaterThan",
    LT: "LessThan",
  };

  function condition_obj(field, operator, value) {
    return {
      Field: field, //"Temperature",
      Operator: operator, //from operaters.XYZ obj above,
      Value: value, ///12
    };
  }

  function rules_obj(name, description) {
    return {
      Name: name, //"Temperature Threshold"
      Enabled: true,
      Description: description, //"description text",
      GroupId: groupid, //should look like : "ddb1141c-69ca-4b26-8187-1ad0c4939a32",
      Severity: "critical",
      Conditions: [], //items created with condition_obj()
    };
  }

  //create a description suffix with id + shipmentId
  var descsuffix = " for " + ship.shipmentName + " [ " + ship.shipmentId + " ] ( " + ship.id + " )";

  /*
    in this log we create rule for each tag, and for each rule, and we create a condition object
    for each min and max named threshold values

    note currently, we only create rules/conditions for shipment.shippingUnits[0].tags[0].thresholds[]
    This effectively means that from the PCS2 perspective there is only one set of alarm settings
    for an entire shipment... more work will be done to change the shipment/sensor mapping in PCS2
    and GVA to get individual shipping unit sensor alarms into PCS2.

    we use jsonship to iterate through the shipments and tag sensors
  */
  var addedlist = {};

  /* dive into the shipment and create a rule and condition for each sensor threshold */
  for (var gateway in jsonship.gateways) {
    var units = jsonship.gateways[gateway].shippingUnits;

    for (var unit in units) {
      var tags = units[unit].tags;

      for (var tag in tags) {
        var thresholds = tags[tag].thresholds;

        for (var sensorname in thresholds) {

          /* if it doesn't exist in the map, add it */
          if (!addedlist[sensorname]) {

            addedlist[sensorname] = true;

            if (thresholds[sensorname]['min']) {

              /* now create a rule for this sensor */
              var addrule = rules_obj(sensorname + " threshold", sensorname + descsuffix);

              Logging.msg("adding PCS2 min condition for : " + sensorname);

              //make sure sensor name is lower case to match the schemas
              addrule.Conditions.push(
                condition_obj(sensorname.toLowerCase(),
                  operators.LT,
                  thresholds[sensorname]['min']));

              retobject.rules.push(addrule);
            }

            if (thresholds[sensorname]['max']) {

              /* now create a rule for this sensor */
              var addrule = rules_obj(sensorname + " threshold", sensorname + descsuffix);

              Logging.msg("adding PCS2 max condition for : " + sensorname);

              addrule.Conditions.push(
                condition_obj(sensorname.toLowerCase(),
                  operators.GT,
                  thresholds[sensorname]['max']));

              retobject.rules.push(addrule);
            }

          }

        }

      }

    }

  }

  return retobject;
};

/**
 * Return only the shipment information required for com.intel.wsn.multipleConfigChangeReq.
 *
 * @param {object} Shipment model from Sequelize, e.g. acquired via exports.findByPrimaryKey.
 * @return {object}
 * - {string} gatewayId
 * - {array} tagWsnId List of integers
 * - {array} configParams See "Change multiple configuration" in latest north-to-south JSON specification doc.
 */
exports.shipment.modelToConfigChangeTagData = (ship) => {
  const tagWsnIds = [];
  let configParams = [];

  let gatewayId; // DECEMBER HACK

  ship.gateways.forEach(gateway => {
    gatewayId = gateway.uuid; // DECEMBER HACK

    gateway.shippingUnits.forEach(shippingUnit => {
      shippingUnit.tags.forEach(tag => {
        tagWsnIds.push(tag.wsnId);

        // For December, there are not per-tag thresholds. Collect the global thresholds from the first tag.
        // - Coerce to integers to strings to match specification.
        // - Set 'enable' and 'thrIsValid' to 'yes' until there is further documentation how to decide the value.
        if (configParams.length === 0) {
          configParams = [{
              type: 'light',
              enable: 'yes',
              thrIsValid: 'yes',
              thresholds: {
                min: '' + tag.lightMin,
                max: '' + tag.lightMax
              }
            },
            {
              type: 'humidity',
              enable: 'yes',
              thrIsValid: 'yes',
              thresholds: {
                min: '' + tag.humidityMin,
                max: '' + tag.humidityMax
              }
            },
            {
              type: 'temperature',
              enable: 'yes',
              thrIsValid: 'yes',
              thresholds: {
                min: '' + tag.temperatureMin,
                max: '' + tag.temperatureMax
              }
            },
            {
              type: 'pressure',
              enable: 'yes',
              thrIsValid: 'yes',
              thresholds: {
                min: '' + tag.pressureMin,
                max: '' + tag.pressureMax
              }
            },
            {
              type: 'battery',
              enable: 'yes',
              thrIsValid: 'yes',
              thresholds: {
                min: '' + tag.batteryMin
              }
            },
            {
              type: 'shock',
              enable: 'yes',
              thrIsValid: 'yes',
              thresholds: {
                max: '' + tag.shockMax
              }
            },
            {
              type: 'tilt',
              enable: 'yes',
              thrIsValid: 'yes',
              thresholds: {
                max: '' + tag.tiltMax
              }
            }
          ];
        }
      });
    });
  });

  return {
    // DECEMBER HACK: provide the ID of the only gateway expected
    gatewayId: gatewayId,

    tagWsnIds: tagWsnIds,
    configParams: configParams
  };
};

/**
 * Return only the shipment information required for com.intel.wsn.disassociationReq.
 *
 * @param {object} Shipment model from Sequelize, e.g. acquired via exports.findByPrimaryKey.
 * @return {object}
 * - {string} gatewayId
 * - {array} tagWsnId List of integers
 */
exports.shipment.modelToDisassociationData = (ship) => {
  const tagWsnIds = [];

  let gatewayId; // DECEMBER HACK

  ship.gateways.forEach(gateway => {
    gatewayId = gateway.uuid; // DECEMBER HACK

    gateway.shippingUnits.forEach(shippingUnit => {
      shippingUnit.tags.forEach(tag => {
        tagWsnIds.push(tag.wsnId);
      });
    });
  });

  return {
    // DECEMBER HACK: provide the ID of the only gateway expected
    gatewayId: gatewayId,

    tagWsnIds: tagWsnIds
  };
};

exports.dataType = {};
exports.dataType.forceInt = (val) => {
  if (typeof val === 'string') {
    val = parseInt(val, 10);
  }
  if (isNaN(val) || !Number.isInteger(val) || !Number.isFinite(val)) {
    val = 0;
  }
  return val;
};
exports.dataType.forceZeroOrPositiveInt = (val) => {
  val = exports.dataType.forceInt(val);
  return val < 0 ? 0 : val;
};
exports.dataType.forceFloat = (val) => {
  if (typeof val === 'string') {
    val = val.replace(/[^0-9.-].*/, '');
    val = parseFloat(val, 10);
  }
  if (isNaN(val) || !Number.isFinite(val)) {
    val = 0;
  }
  return val;
};
exports.dataType.forceZeroOrPositiveFloat = (val) => {
  val = exports.dataType.forceFloat(val);
  return val < 0 ? 0 : val;
};