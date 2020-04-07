'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint('Users', ['email'], {
        type: 'unique',
        name: 'unique_user_email'
      }),

      queryInterface.addConstraint('Roles', ['name'], {
        type: 'unique',
        name: 'unique_role_name'
      }),

      queryInterface.addConstraint('Gateways', ['uuid'], {
        type: 'unique',
        name: 'unique_gateway_uuid'
      }),

      queryInterface.addConstraint('Shipments', ['uShipmentId'], {
        type: 'unique',
        name: 'unique_shipment_uShipmentId'
      }),

      queryInterface.addConstraint('ShippingUnits', ['packageId'], {
        type: 'unique',
        name: 'unique_shippingunit_packageId'
      }),

      queryInterface.addConstraint('Tags', ['uuid'], {
        type: 'unique',
        name: 'unique_tag_uuid'
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint('Users', 'unique_user_email'),
      queryInterface.removeConstraint('Roles', 'unique_role_name'),
      queryInterface.removeConstraint('Gateways', 'unique_gateway_uuid'),
      queryInterface.removeConstraint('Shipments', 'unique_shipment_uShipmentId'),
      queryInterface.removeConstraint('ShippingUnits', 'unique_shippingunit_packageId'),
      queryInterface.removeConstraint('Tags', 'unique_tag_uuid')
    ]);
  }
};
