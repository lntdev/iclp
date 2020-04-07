'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('Shipments', 'gw2CloudReporingTime','gw2CloudReportingTime');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('Shipments', 'gw2CloudReportingTime','gw2CloudReporingTime');
  }
};
