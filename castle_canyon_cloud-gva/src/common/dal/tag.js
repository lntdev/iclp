const Logging   = require('cccommon/logging').logger('common.dal.tag');
Logging.enable();

const models = require('cccommon/models/internaldb');

/**
 * Find the tag and all associated shipping units, gateways, and shipments.
 *
 * The purpose is to support "reverse" look ups in order to find out if a shipment
 * already exists that's associated the given tag, in order to prevent multiple
 * shipments from using the same tag. Shipping units and gateways are involved
 * in the query in order to work backward from the tag through all the intermediate
 * join tables.
 */
exports.findByUUID = (uuid, options) => {
  options = options || {};

  return models.Tag.findAll(
    Object.assign(
      {
        where: {
          uuid: uuid
        },
        include: [
          {
            association: models.Tag.ShippingUnit,
            include: [
              {
                association: models.ShippingUnit.Shipment
              }
            ]
          }
        ]
      },
      options
    )
  );
};
