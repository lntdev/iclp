'use strict';

const tableName = 'Shipments';

// DECEMBER HACK: This data should probably not be duplicated into this database. And if it remains in this database,
// it may be cleaner to hold in a separate table.

module.exports = {
  up: (queryInterface, Sequelize) => {
    const steps = [];
    steps.push(queryInterface.addColumn(tableName, 'telemetryReportingTime', {
      type: Sequelize.DATE
    }));
    steps.push(queryInterface.addColumn(tableName, 'telemetryLatitude', {
      type: Sequelize.DOUBLE
    }));
    steps.push(queryInterface.addColumn(tableName, 'telemetryLongitude', {
      type: Sequelize.DOUBLE
    }));
    return Promise.all(steps);
  },

  down: (queryInterface, Sequelize) => {
    const steps = [];
    steps.push(queryInterface.removeColumn(tableName, 'telemetryReportingTime'));
    steps.push(queryInterface.removeColumn(tableName, 'telemetryLatitude'));
    steps.push(queryInterface.removeColumn(tableName, 'telemetryLongitude'));
    return Promise.all(steps);
  }
};
