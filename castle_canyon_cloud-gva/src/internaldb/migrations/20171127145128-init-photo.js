'use strict';

const tableName = 'Shipments';
const columnNames = [
  'photoProofOfDeliveryUrl',
  'photoProofOfDeliveryNote',
  'photoDocumentationUrl',
  'photoDocumentationNote'
];

module.exports = {
  up: (queryInterface, Sequelize) => {
    const steps = [];
    columnNames.forEach(columnName => {
      steps.push(queryInterface.addColumn(tableName, columnName, {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      }));
    });
    return Promise.all(steps);
  },

  down: (queryInterface, Sequelize) => {
    const steps = [];
    columnNames.forEach(columnName => {
      steps.push(queryInterface.removeColumn(tableName, columnName));
    });
    return Promise.all(steps);
  }
};
