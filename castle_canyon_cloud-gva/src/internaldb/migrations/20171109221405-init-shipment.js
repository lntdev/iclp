'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Shipments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shipmentId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      uShipmentId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shipmentName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shippingUnitCount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      referenceId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shipmentNote: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerAddrLine1: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerAddrCity: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerAddrState: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerAddrPin: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerAddrCountry: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerAddrPhone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      earliestPickup: {
        type: Sequelize.DATE,
        allowNull: false
      },
      latestDelivery: {
        type: Sequelize.DATE,
        allowNull: false
      },
      tag2GwReportingTime: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      gw2CloudReporingTime: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Shipments');
  }
};
