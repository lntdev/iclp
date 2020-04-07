'use strict';
const tableName = 'Shipments';
module.exports = {
  up: (queryInterface, Sequelize) => {
    const steps = [];
    /* add new coloumn */
    steps.push(queryInterface.addColumn(tableName, 'recipientName', {type: Sequelize.STRING}));
    return Promise.all(steps);
  },

  down: (queryInterface, Sequelize) => {
    const steps = [];
    /* remove coloumn */
    steps.push(queryInterface.removeColumn(tableName, 'recipientName'));
    return Promise.all(steps);
  }
};
