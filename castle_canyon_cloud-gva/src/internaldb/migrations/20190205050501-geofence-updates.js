'use strict';
const tableName = 'Geofences';
module.exports = {
  up: (queryInterface, Sequelize) => {
    const steps = [];
    /* remove depricated coloumns */
    steps.push(queryInterface.removeColumn(tableName, 'latitude'));
    steps.push(queryInterface.removeColumn(tableName, 'longitude'));
    steps.push(queryInterface.removeColumn(tableName, 'radius'));
    steps.push(queryInterface.removeColumn(tableName, 'fenceType'));
    /* add new coloumns */
    steps.push(queryInterface.addColumn(tableName, 'type', {type: Sequelize.STRING}));
    steps.push(queryInterface.addColumn(tableName, 'shape', {type: Sequelize.STRING}));
    steps.push(queryInterface.addColumn(tableName, 'coordinates', {type: Sequelize.STRING}));
    steps.push(queryInterface.addColumn(tableName, 'breachAction', {type: Sequelize.STRING}));
    /* done */
    return Promise.all(steps);
  },

  down: (queryInterface, Sequelize) => {
    const steps = [];
    /* remove coloumns */
    steps.push(queryInterface.removeColumn(tableName, 'type'));
    steps.push(queryInterface.removeColumn(tableName, 'shape'));
    steps.push(queryInterface.removeColumn(tableName, 'coordinates'));
    steps.push(queryInterface.removeColumn(tableName, 'breachAction'));
    /* add old coloumns */
    steps.push(queryInterface.addColumn(tableName, 'latitude', {type: Sequelize.STRING, allowNull: false}));
    steps.push(queryInterface.addColumn(tableName, 'longitude', {type: Sequelize.STRING, allowNull: false}));
    steps.push(queryInterface.addColumn(tableName, 'radius', {type: Sequelize.STRING, allowNull: false}));
    steps.push(queryInterface.addColumn(tableName, 'fenceType', {type: Sequelize.STRING, allowNull: false}));
    /* done */
    return Promise.all(steps);
  }
};
