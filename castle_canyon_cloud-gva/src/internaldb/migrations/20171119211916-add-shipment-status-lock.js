'use strict';

const tableName = 'Shipments';
const columnName = 'statusLockUserId';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(tableName, columnName, {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(tableName, columnName);
  }
};
