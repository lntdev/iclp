'use strict';
const tableName = 'ShippingUnits';
module.exports = {
  up: (queryInterface, Sequelize) => {
    const steps = [];
    /* add new coloumn */
    steps.push(queryInterface.removeColumn(tableName, 'gatewayId'));
    steps.push(queryInterface.addColumn(tableName, 'shipmentId', {type: Sequelize.STRING}));
    return Promise.all(steps);
  },

  down: (queryInterface, Sequelize) => {
    const steps = [];
    /* remove coloumn */
    steps.push(queryInterface.addColumn(tableName, 'gatewayId', {type: Sequelize.STRING}));
    steps.push(queryInterface.removeColumn(tableName, 'shipmentId'));
    return Promise.all(steps);
  }
};
