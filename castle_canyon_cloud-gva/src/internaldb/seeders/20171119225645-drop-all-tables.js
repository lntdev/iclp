'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable('SequelizeMeta'),
      queryInterface.dropTable('Users'),
      queryInterface.dropTable('UsersRoles'),
      queryInterface.dropTable('Roles'),
      queryInterface.dropTable('Shipments'),
      queryInterface.dropTable('ShippingUnits'),
      queryInterface.dropTable('Tags'),
      queryInterface.dropTable('Gateways'),
      queryInterface.dropTable('ShipmentsGateways'),
      queryInterface.dropTable('ShippingUnitsTags'),
      queryInterface.dropTable('Legs')
    ]);
  },

  down: (queryInterface, Sequelize) => {
  }
};
