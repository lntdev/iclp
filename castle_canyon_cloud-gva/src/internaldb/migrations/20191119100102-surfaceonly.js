'use strict';
const tableName = 'Shipments';
module.exports = {
  up: (queryInterface, Sequelize) => {
    const steps = [];
    steps.push(queryInterface.addColumn(tableName, 'surfaceOnly', {
        type: Sequelize.BOOLEAN
      }));
    return Promise.all(steps);
  },

  down: (queryInterface, Sequelize) => {
    const steps = [];
    steps.push(queryInterface.removeColumn(tableName, 'surfaceOnly'));
    return Promise.all(steps);
  }
};
