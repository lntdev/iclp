'use strict';

const tableName = 'Tags';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const steps = [];
    steps.push(queryInterface.addColumn(tableName, 'temperatureIsEnabled', {
        type: Sequelize.BOOLEAN
      }));
      steps.push(queryInterface.addColumn(tableName, 'humidityIsEnabled', {
        type: Sequelize.BOOLEAN
      }));
      steps.push(queryInterface.addColumn(tableName, 'lightIsEnabled', {
        type: Sequelize.BOOLEAN
      }));
      steps.push(queryInterface.addColumn(tableName, 'shockIsEnabled', {
        type: Sequelize.BOOLEAN
      }));
      steps.push(queryInterface.addColumn(tableName, 'tiltIsEnabled', {
        type: Sequelize.BOOLEAN
      }));
      steps.push(queryInterface.addColumn(tableName, 'pressureIsEnabled', {
        type: Sequelize.BOOLEAN
      }));
      steps.push(queryInterface.addColumn(tableName, 'batteryIsEnabled', {
        type: Sequelize.BOOLEAN
      }));
              
    return Promise.all(steps);
  },

  down: (queryInterface, Sequelize) => {
    const steps = [];
    steps.push(queryInterface.removeColumn(tableName, 'temperatureIsEnabled'));
    steps.push(queryInterface.removeColumn(tableName, 'humidityIsEnabled'));
    steps.push(queryInterface.removeColumn(tableName, 'lightIsEnabled'));
    steps.push(queryInterface.removeColumn(tableName, 'shockIsEnabled'));
    steps.push(queryInterface.removeColumn(tableName, 'tiltIsEnabled'));
    steps.push(queryInterface.removeColumn(tableName, 'pressureIsEnabled'));
    steps.push(queryInterface.removeColumn(tableName, 'batteryIsEnabled'));
    
    return Promise.all(steps);
  }
};
