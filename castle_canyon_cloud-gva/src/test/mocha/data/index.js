/**
 * These values can be used for field when they won't impact the subject-under-test
 * and any valid value is sufficient.
 *
 * They're provided via functions so that reference typos will break the test instead of
 * allowing silent use of undefined values.
 */

const crypto = require('crypto');
const format = require('cccommon/format');

const misc = {};
misc.anyDate = () => { return format.datetime.toMysql(new Date()); };
misc.anyHwId = () => { return randHexBytes(8); };

const tag = {};
tag.anyWsnId = (offset) => { return 0x2000 + (offset || 0); };
tag.anyTemperatureMin = () => { return 30; };
tag.anyTemperatureMax = () => { return 70; };
tag.anyHumidityMin = () => { return 50; };
tag.anyHumidityMax = () => { return 75; };
tag.anyLightMin = () => { return 20; };
tag.anyLightMax = () => { return 30; };
tag.anyPressureMin = () => { return 80; };
tag.anyPressureMax = () => { return 90; };
tag.anyTiltMax = () => { return 5; };
tag.anyShockMax = () => { return 13; };
tag.anyBatteryMin = () => { return 25; };
tag.any = () => {
  return {
    uuid: misc.anyHwId(),
    wsnId: tag.anyWsnId(),
    temperatureMin: tag.anyTemperatureMin(),
    temperatureMax: tag.anyTemperatureMax(),
    humidityMin: tag.anyHumidityMin(),
    humidityMax: tag.anyHumidityMax(),
    lightMin: tag.anyLightMin(),
    lightMax: tag.anyLightMax(),
    pressureMin: tag.anyPressureMin(),
    pressureMax: tag.anyPressureMax(),
    tiltMax: tag.anyTiltMax(),
    shockMax: tag.anyShockMax(),
    batteryMin: tag.anyBatteryMin()
  };
};

const shippingUnit = {};
shippingUnit.anyPackageId = () => { return 'any packageId ' + randHexBytes(8); };
shippingUnit.any = () => {
  return {
    packageId: shippingUnit.anyPackageId(),
    tags: [
      tag.any()
    ]
  };
};

const gateway = {};
gateway.anyWsnId = () => { return 0x8000; };
gateway.anyPanId = () => { return 0x4000; };
gateway.anyChannelId = () => { return 0x1; };
gateway.any = () => {
  return {
    uuid: misc.anyHwId(),
    wsnId: gateway.anyWsnId(),
    panId: gateway.anyPanId(),
    channelId: gateway.anyChannelId(),
    shippingUnits: [
      shippingUnit.any()
    ]
  };
};

// This section was intended to support distinct Address entities that were not included
// in the December demo for expediency. We'll keep them here in case a later phase
// requires that entity type.
const address = {};
address.anyLabel = () => { return 'any label ' + randHexBytes(8); };
address.anyLine1 = () => { return 'any line1 ' + randHexBytes(8); };
address.anyCity = () => { return 'any city ' + randHexBytes(8); };
address.anyState = () => { return 'any state ' + randHexBytes(8); };
address.anyPin = () => { return 'any pin ' + randHexBytes(8); };
address.anyCountry = () => { return 'any country ' + randHexBytes(8); };
address.anyPhone = () => { return 'any phone ' + randHexBytes(8); };

const leg = {};
leg.order = () => { return 1; };
leg.any = () => {
  return {
    order: leg.order(),

    // In a future iteration, these should be represented by distinct Address entities
    // or similar. See comments in the above address-related functions or the Leg model module.
    fromLabel: address.anyLabel(),
    fromLine1: address.anyLine1(),
    fromCity: address.anyCity(),
    fromState: address.anyState(),
    fromPin: address.anyPin(),
    fromCountry: address.anyCountry(),
    fromPhone: address.anyPhone(),

    // In a future iteration, these should be represented by distinct Address entities
    // or similar. See comments in the above address-related functions or the Leg model module.
    toLabel: address.anyLabel(),
    toLine1: address.anyLine1(),
    toCity: address.anyCity(),
    toState: address.anyState(),
    toPin: address.anyPin(),
    toCountry: address.anyCountry(),
    toPhone: address.anyPhone()
  };
};

const shipment = {};
shipment.anyStatus = () => { return 'new'; };
shipment.anyShipmentId = () => { return 'any shipmentId'; };
shipment.anyUniqueShipmentId = () => { return 'any uShipmentId ' + randHexBytes(8); };
shipment.anyShipmentName = () => { return 'any shipmentName'; };
shipment.anyShippingUnitCount = () => { return 2; };
shipment.anyReferenceId = () => { return 'any referenceId'; };
shipment.anyShipmentNote = () => { return 'any shipmentNote'; };
shipment.anyCustomerName = () => { return 'any customerName'; };
shipment.anyCustomerEmail = () => { return 'anyCustomer@' + randHexBytes(8); };
shipment.anyTag2GwReportingTime = () => { return 123; };
shipment.anyGw2CloudReporingTime = () => { return 456; };
shipment.any = () => {
  return {
    status: shipment.anyStatus(),
    shipmentId: shipment.anyShipmentId(),
    uShipmentId: shipment.anyUniqueShipmentId(),
    shipmentName: shipment.anyShipmentName(),
    shippingUnitCount: shipment.anyShippingUnitCount(),
    referenceId: shipment.anyReferenceId(),
    shipmentNote: shipment.anyShipmentNote(),
    customerName: shipment.anyCustomerName(),
    customerEmail: shipment.anyCustomerEmail(),
    customerAddrLine1: address.anyLine1(),
    customerAddrCity: address.anyCity(),
    customerAddrState: address.anyState(),
    customerAddrPin: address.anyPin(),
    customerAddrCountry: address.anyCountry(),
    customerAddrPhone: address.anyPhone(),
    earliestPickup: misc.anyDate(),
    latestDelivery: misc.anyDate(),
    tag2GwReportingTime: shipment.anyTag2GwReportingTime(),
    gw2CloudReportingTime: shipment.anyGw2CloudReporingTime(),
    gateways: [
      gateway.any()
    ],
    legs: [
      leg.any()
    ]
  };
};

const regex = {};

regex.MSSQL_ISO8601 = () => { return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/; };

function randHexBytes(n) { return crypto.randomBytes(n).toString('hex'); }

const reqBody = {};
reqBody.shipments = {};
reqBody.shipments.validPostTag = () => {
  return {
    thresholds: {
      temperature: {
        min: tag.anyTemperatureMin(),
        max: tag.anyTemperatureMax()
      },
      humidity: {
        min: tag.anyHumidityMin(),
        max: tag.anyHumidityMax()
      },
      light: {
        min: tag.anyLightMin(),
        max: tag.anyLightMax()
      },
      pressure: {
        min: tag.anyPressureMin(),
        max: tag.anyPressureMax()
      },
      tilt: {
        max: tag.anyTiltMax()
      },
      shock: {
        max: tag.anyShockMax()
      },
      battery: {
        min: tag.anyBatteryMin()
      }
    }
  };
};
reqBody.shipments.zeroValuePostTag = () => {
  return {
    thresholds: {
      temperature: {
        min: 0,
        max: 0
      },
      humidity: {
        min: 0,
        max: 0
      },
      light: {
        min: 0,
        max: 0
      },
      pressure: {
        min: 0,
        max: 0
      },
      tilt: {
        max: 0
      },
      shock: {
        max: 0
      },
      battery: {
        min: 0
      }
    }
  };
};
reqBody.shipments.negValuePostTag = () => {
  return {
    thresholds: {
      temperature: {
        min: -1,
        max: -1
      },
      humidity: {
        min: -1,
        max: -1
      },
      light: {
        min: -1,
        max: -1
      },
      pressure: {
        min: -1,
        max: -1
      },
      tilt: {
        max: -1
      },
      shock: {
        max: -1
      },
      battery: {
        min: -1
      }
    }
  };
};
reqBody.shipments.validPost = () => {
  return {
    shipmentId: shipment.anyShipmentId(),
    uShipmentId: shipment.anyUniqueShipmentId(),
    shipmentName: shipment.anyShipmentName(),
    shippingUnitCount: shipment.anyShippingUnitCount(),
    referenceId: shipment.anyReferenceId(),
    shipmentNote: shipment.anyShipmentNote(),
    customerName: shipment.anyCustomerName(),
    customerEmail: shipment.anyCustomerEmail(),
    customerAddress: {
      line1: address.anyLine1(),
      city: address.anyCity(),
      state: address.anyState(),
      pin: address.anyPin(),
      country: address.anyCountry(),
      phone: address.anyPhone()
    },
    earliestPickup: misc.anyDate(),
    latestDelivery: misc.anyDate(), // validation of time distance/logic is not the SUT
    tag2GwReportingTime: shipment.anyTag2GwReportingTime(),
    gw2CloudReportingTime: shipment.anyGw2CloudReporingTime(),
    pickupAddress: {
      line1: address.anyLine1(),
      city: address.anyCity(),
      state: address.anyState(),
      pin: address.anyPin(),
      country: address.anyCountry(),
      phone: address.anyPhone()
    },
    deliveryAddress: {
      line1: address.anyLine1(),
      city: address.anyCity(),
      state: address.anyState(),
      pin: address.anyPin(),
      country: address.anyCountry(),
      phone: address.anyPhone()
    },
    gateways: [
      {
        shippingUnits: [
          {
            tags: [
              reqBody.shipments.validPostTag()
            ]
          },
          {
            tags: [
              reqBody.shipments.validPostTag()
            ]
          }
        ]
      }
    ]
  };
};
reqBody.shipments.zeroValueThresholdsPost = () => {
  const body = reqBody.shipments.validPost();
  body.gateways.forEach((gateway, g) => {
    gateway.shippingUnits.forEach((shippingUnit, su) => {
      shippingUnit.tags.forEach((tag, t) => {
        body.gateways[g].shippingUnits[su].tags[t] = reqBody.shipments.zeroValuePostTag();
      });
    });
  });
  return body;
};
reqBody.shipments.negValueThresholdsPost = () => {
  const body = reqBody.shipments.validPost();
  body.gateways.forEach((gateway, g) => {
    gateway.shippingUnits.forEach((shippingUnit, su) => {
      shippingUnit.tags.forEach((tag, t) => {
        body.gateways[g].shippingUnits[su].tags[t] = reqBody.shipments.negValuePostTag();
      });
    });
  });
  return body;
};

const monitor = {};
monitor.validPut = () => {
  return {
    gateways: [
      {
        id: misc.anyHwId(),
        shippingUnits: [
          {
            id: shippingUnit.anyPackageId(),
            tags: [
              {
                id: misc.anyHwId(),
                wsnId: tag.anyWsnId()
              }
            ]
          },
          {
            id: shippingUnit.anyPackageId(),
            tags: [
              {
                id: misc.anyHwId(),
                wsnId: tag.anyWsnId(1)
              }
            ]
          }
        ]
      }
    ]
  };
};

const photo = {};
photo.anyNote = () => { return 'any note' + randHexBytes(8); };

module.exports = {
  gateway: gateway,
  shippingUnit: shippingUnit,
  tag: tag,
  address: address,
  leg: leg,
  shipment: shipment,
  regex: regex,
  misc: misc,
  user: require('./user'),
  reqBody: reqBody,
  monitor: monitor,
  photo: photo
};
