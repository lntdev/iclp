const Logging = require('cccommon/logging').logger('common.dal.shipment');
Logging.enable();

const gatewayDal = require('cccommon/dal/gateway');
const tagDal = require('cccommon/dal/tag');
const shipFsm = require('cccommon/shipment/fsm');
const models = require('cccommon/models/internaldb');
const format = require('cccommon/format');
const constant = require('cccommon/constant');
const gwmClient = require('cccommon/client/gwmessenger');
const photoConst = constant.photo;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

/**
 * Create a shipment and associated models.
 *
 * @param {object} values Sequelize Model#create values object.
 */
exports.create = (values) => {
  return models.Shipment.create(
    values, {
      include: exports.coreInclude()
    }
  );
};

exports.coreInclude = () => {
  return [{
      association: models.Shipment.ShippingUnit,
      include: [{
        association: models.ShippingUnit.Tag
      }]
    },
    {
      association: models.Shipment.Leg
    },
    {
      association: models.Shipment.Geofence
    },
    {
      association: models.Shipment.StatusLockUser
    }
  ];
};

/**
 * Find all shipments associated with the given gateway.
 *
 * The purpose is to support "reverse" look ups in order to find out if a shipment
 * already exists that's associated the given gateways, in order to prevent multiple
 * shipments from using the same gateway.
 */
exports.findByGatewayUUID = async (uuid, options) => {
  options = options || {};

  const found = [];

  const gateways = await gatewayDal.findByUUID(uuid, options);
  for (let gateway of gateways) {
    for (let foundShip of gateway.shipments) {
      found.push(foundShip);
    }
  }

  return found;
};

/**
 * Find all shipments associated with the given tag.
 *
 * The purpose is to support "reverse" look ups in order to find out if a shipment
 * already exists that's associated the given tag, in order to prevent multiple
 * shipments from using the same tag. Shipping units and gateways are involved
 * in the query in order to work backward from the tag through all the intermediate
 * join tables.
 */
exports.findByTagUUID = async (uuid, options) => {
  options = options || {};

  const found = [];

  const tags = await tagDal.findByUUID(uuid, options);

  for (let tag of tags) {
    for (let shippingUnit of tag.shippingUnits) {
      shippingUnit.shipments.tagPackageId = shippingUnit.packageId;
      found.push(shippingUnit.shipments);
    }
  }

  return found;
};

/**
 * Find a shipment by DB primary key and associated models.
 *
 * @param {int} id
 */
exports.findByPrimaryKey = (id) => {
  return models.Shipment.findOne({
    where: {
      id: id
    },
    include: exports.coreInclude()
  });
};

/**
 * Find a shipment by the shipmentId field
 *
 * @param {string} shipmentIdArg
 */
exports.findByShipmentId = (shipmentIdArg) => {
  return models.Shipment.findOne({
    where: {
      shipmentId: shipmentIdArg
    },
    include: exports.coreInclude()
  });
};

/**
 * Find all shipments with no status or one of the selected statuses.
 *
 * @param {array} statuses E.g. ['new', 'inProvision']
 */
exports.findByStatus = (statuses) => {
  const options = {
    include: exports.coreInclude()
  };

  if (statuses && statuses.length) {
    options.where = {
      status: {
        [Op.in]: statuses
      }
    };
  }

  return models.Shipment.findAll(options);
};

exports.deleteAssociations = async (req, shipment, options) => {
  options = options || {};

  const id = shipment.get('id');
  const tagUUIDs = [];

  for (let shippingUnit of shipment.shippingUnits) {
    // Unlink shipping unit from its tags
    await models.ShippingUnitTag.destroy(Object.assign({}, {
        where: {
          shippingUnitId: shippingUnit.get('id')
        }
      },
      options
    ));

    // Delete the tags
    for (let tag of shippingUnit.tags) {
      tagUUIDs.push(tag.uuid);
      await tag.destroy(options);
    }

    await shippingUnit.destroy(options);
  }

  Logging.msg('DAL', {
    action: 'deleteAssociations',
    requestId: req.id,
    tagUUIDs: tagUUIDs,
    shipmentPrimaryKeyId: id
  });
};

exports.deinstrument = async (req, shipment, status, options) => {
  options = options || {};


  await exports.deleteAssociations(req, shipment, options);
  await exports.updateStatus(shipment, status, options);
};

exports.updateStatusAndLock = (shipment, status, statusLockUser, options) => {
  options = options || {};

  exports.throwOnInvalidStatus(status);

  if (!statusLockUser) {
    throw new Error('failed to update shipment status and lock it, user model is missing/empty');
  }

  return shipment.update({
      status: status,
      statusLockUserId: statusLockUser.get('id')
    },
    options
  );
};

exports.updateStatusAndUnlock = (shipment, status, options) => {
  options = options || {};

  exports.throwOnInvalidStatus(status);

  return shipment.update({
      status: status,
      statusLockUserId: 0
    },
    options
  );
};

exports.updateStatus = (shipment, status, options) => {
  options = options || {};

  exports.throwOnInvalidStatus(status);

  return shipment.update({
      status: status
    },
    options
  );
};

exports.deleteOne = async (req, shipment) => {
  await exports.deleteAssociations(req, shipment);
  await shipment.destroy();
};

exports.deleteAll = async (req) => {
  const all = await models.Shipment.findAll();
  for (let shipment of all) {
    await exports.deleteOne(req, shipment);
  }
};

exports.throwOnInvalidStatus = (status) => {
  if (!status || status === '') {
    throw new Error('failed to update shipment status, value is missing/empty');
  }

  if (!shipFsm.validateState(status)) {
    throw new Error(`failed to update shipment status, value [${status}] was not found in FSM`);
  }
};

exports.updateStatusLockUser = (shipment, user) => {
  return shipment.update({
    statusLockUserId: user.get('id')
  });
};

exports.photoUrl = (shipment, type) => {
  if (type === photoConst.type.doc()) {
    return shipment.photoDocumentationUrl || '';
  } else if (type === photoConst.type.pod()) {
    return shipment.photoProofOfDeliveryUrl || '';
  } else {
    throw new Error(`failed to inspect photo URLs, invalid type [${type}]`);
  }
};

exports.updatePhoto = (shipment, type, spec) => {
  const attrs = {};
  if (type === photoConst.type.doc()) {
    attrs.photoDocumentationUrl = spec.url;
    attrs.photoDocumentationNote = spec.note;
  } else if (type === photoConst.type.pod()) {
    attrs.photoProofOfDeliveryUrl = spec.url;
    attrs.photoProofOfDeliveryNote = spec.note;
  } else {
    throw new Error(`failed to update photo, invalid type [${type}]`);
  }
  return shipment.update(attrs);
};

exports.deletePhoto = (shipment, type) => {
  const attrs = {};
  if (type === photoConst.type.doc()) {
    attrs.photoDocumentationUrl = '';
    attrs.photoDocumentationNote = '';
  } else if (type === photoConst.type.pod()) {
    attrs.photoProofOfDeliveryUrl = '';
    attrs.photoProofOfDeliveryNote = '';
  } else {
    throw new Error(`failed to delete photo, invalid type [${type}]`);
  }
  return shipment.update(attrs);
};

exports.addGatewayIdToShipment = (shipment, spec, options) => {
  options = options || {};

  const writes = [];

  Logging.msg("gateway id: " + spec.gateways[0]);
  //currently we support only one Gateway per shipment
  writes.push(shipment.gateways[0].update({
      uuid: spec.gateways[0]
    },
    options
  ))
  return Promise.all(writes);
}

exports.initMonitorConfig = (shipment, spec, options) => {
  options = options || {};

  const writes = [];
  const t = 0; // only one tag per shippingunit

  spec.shippingUnits.forEach((specShippingUnit, su) => {
    // Update packageId.
    writes.push(shipment.shippingUnits[su].update({
        packageId: specShippingUnit.unitId
      },
      options
    ));

    // Update tag UUID & wsnId.
    writes.push(shipment.shippingUnits[su].tags[t].update({
        uuid: specShippingUnit.tagId
      },
      options
    ));
  });

  return Promise.all(writes);
};

exports.changeMonitorConfig = (shipment, spec, options) => {
  options = options || {};

  const writes = [];

  if (spec.tag2GwReportingTime) {
    writes.push(shipment.update({
        tag2GwReportingTime: spec.tag2GwReportingTime
      },
      options
    ));
  }
  if (spec.gw2CloudReportingTime) {
    writes.push(shipment.update({
        gw2CloudReportingTime: spec.gw2CloudReportingTime
      },
      options
    ));
  }

  // DECEMBER HACK: store and apply to all later tags
  let globalTagAttr;

  // DECEMBER HACK: index the tags by UUID so we can update the model instance directly instead of
  // doing a general update with `where`. This allows us to drop the unique UUID constraint
  // since we'll only be working on instances (rows) associated with a given shipment via join tables,
  // and due to the current feature set we won't need to worry about queries by tag UUID and seeing
  // all the shipments that are sharing them during testing.

  const tagsByUuid = {};
  shipment.shippingUnits.forEach(shippingUnit => {
    shippingUnit.tags.forEach(tag => {
      if (tagsByUuid[tag.uuid]) {
        Logging.msg('tag.uuid conflict in changeMonitorConfig', {
          uuid: tag.uuid,
          shipmentPrimaryKeyId: shipment.get('id'),
          shippingUnitId: shippingUnit.get('id')
        });
      } else {
        tagsByUuid[tag.uuid] = tag;
      }
    });
  });

  spec.shippingUnits.forEach(shippingUnit => {
    shippingUnit.tags.forEach(tag => {
      // DECEMBER HACK: store and apply to all later tags
      if (!globalTagAttr) {
        const tagAttr = {};
        const thresholds = tag.thresholds;
        Logging.msg("tag.thresholds: " + JSON.stringify(thresholds));
        if (thresholds.temperature) {
          if (thresholds.temperature.enable !== undefined) {
            tagAttr.temperatureIsEnabled = thresholds.temperature.enable;
          }
          if (thresholds.temperature.min !== undefined) {
            tagAttr.temperatureMin = format.dataType.forceFloat(tag.thresholds.temperature.min);
          }
          if (thresholds.temperature.max !== undefined) {
            tagAttr.temperatureMax = format.dataType.forceFloat(tag.thresholds.temperature.max);
          }
        }
        if (thresholds.humidity) {
          if (thresholds.humidity.enable !== undefined) {
            tagAttr.humidityIsEnabled = thresholds.humidity.enable;
          }
          if (thresholds.humidity.min !== undefined) {
            if (thresholds.humidity.min !== undefined) {
              tagAttr.humidityMin = format.dataType.forceFloat(tag.thresholds.humidity.min);
            }
            if (thresholds.humidity.max !== undefined) {
              tagAttr.humidityMax = format.dataType.forceFloat(tag.thresholds.humidity.max);
            }
          }
        }
        if (thresholds.light) {
          if (thresholds.light.enable !== undefined) {
            tagAttr.lightIsEnabled = thresholds.light.enable;
          }
          if (thresholds.light.min !== undefined) {
            tagAttr.lightMin = format.dataType.forceFloat(tag.thresholds.light.min);
          }
          if (thresholds.light.max !== undefined) {
            tagAttr.lightMax = format.dataType.forceFloat(tag.thresholds.light.max);
          }
        }
        if (thresholds.pressure) {
          if (thresholds.pressure.enable !== undefined) {
            tagAttr.pressureIsEnabled = thresholds.pressure.enable;
          }
          if (thresholds.pressure.min !== undefined) {
            tagAttr.pressureMin = format.dataType.forceFloat(tag.thresholds.pressure.min);
          }
          if (thresholds.pressure.max !== undefined) {
            tagAttr.pressureMax = format.dataType.forceFloat(tag.thresholds.pressure.max);
          }
        }
        if (thresholds.tilt) {
          if (thresholds.tilt.enable !== undefined) {
            tagAttr.tiltIsEnabled = thresholds.tilt.enable;
          }
          if (thresholds.tilt.max !== undefined) {
            tagAttr.tiltMax = format.dataType.forceFloat(tag.thresholds.tilt.max);
          }
        }
        if (thresholds.shock) {
          if (thresholds.shock.enable !== undefined) {
            tagAttr.shockIsEnabled = thresholds.shock.enable;
          }
          if (thresholds.shock.max !== undefined) {
            tagAttr.shockMax = format.dataType.forceFloat(tag.thresholds.shock.max);
          }
        }
        if (thresholds.battery) {
          if (thresholds.battery.enable !== undefined) {
            tagAttr.batteryIsEnabled = thresholds.battery.enable;
          }
          if (thresholds.battery.min !== undefined) {
            tagAttr.batteryMin = format.dataType.forceFloat(tag.thresholds.battery.min);
          }
        }
        globalTagAttr = Object.assign({}, tagAttr);
      }

      if (tagsByUuid[tag.id]) {
        writes.push(tagsByUuid[tag.id].update(
          globalTagAttr,
          options
        ));
      } else {
        Logging.msg('tag not found by UUID in changeMonitorConfig', {
          uuid: tag.id,
          shipmentPrimaryKeyId: shipment.get('id')
        });
      }
    });
  });

  return Promise.all(writes);
};

exports.updatePackageIds = (shipment, spec, options) => {
  options = options || {};
  const writes = [];
  Logging.msg("Shipment: " + JSON.stringify(shipment));
  Logging.msg("Spec: " + JSON.stringify(spec));
  shipment.shippingUnits.forEach((shippingUnit, su) => {
    shippingUnit.tags.forEach((tag, t) => {
      if (spec.hasOwnProperty(tag.uuid)) {
        writes.push(shipment.gateways[g].shippingUnits[su].update({
          packageId: spec[tag.uuid]
        },
          options
        ));
      }
    });
  });
  return Promise.all(writes);
};
