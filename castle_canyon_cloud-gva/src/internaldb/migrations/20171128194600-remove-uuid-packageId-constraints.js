'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint('Gateways', 'unique_gateway_uuid'),
      queryInterface.removeConstraint('ShippingUnits', 'unique_shippingunit_packageId'),
      queryInterface.removeConstraint('Tags', 'unique_tag_uuid')
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint('Gateways', ['uuid'], {
        type: 'unique',
        name: 'unique_gateway_uuid'
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
  }
};
