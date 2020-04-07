'use strict';
const tableName = 'Gateways';
module.exports = {
  up: (queryInterface, Sequelize) => {
    const steps = [];
    /* add new coloumn */
    steps.push(queryInterface.addColumn(tableName, 'beaconKey', {type: Sequelize.STRING}));
    steps.push(queryInterface.addColumn(tableName, 'microInterval', {type: Sequelize.INTEGER}));
    steps.push(queryInterface.addColumn(tableName, 'macroInterval', {type: Sequelize.INTEGER}));
    return Promise.all(steps);
  },

  down: (queryInterface, Sequelize) => {
    const steps = [];
    /* remove coloumn */
    steps.push(queryInterface.removeColumn(tableName, 'beaconKey'));
    steps.push(queryInterface.removeColumn(tableName, 'microInterval'));
    steps.push(queryInterface.removeColumn(tableName, 'macroInterval'));
    return Promise.all(steps);
  }
};
