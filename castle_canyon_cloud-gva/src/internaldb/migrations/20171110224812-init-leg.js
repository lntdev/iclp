'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Legs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      fromLabel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fromLine1: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fromCity: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fromState: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fromPin: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fromCountry: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fromPhone: {
        type: Sequelize.STRING,
        allowNull: false
      },

      toLabel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      toLine1: {
        type: Sequelize.STRING,
        allowNull: false
      },
      toCity: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      toState: {
        type: Sequelize.STRING,
        allowNull: false
      },
      toPin: {
        type: Sequelize.STRING,
        allowNull: false
      },
      toCountry: {
        type: Sequelize.STRING,
        allowNull: false
      },
      toPhone: {
        type: Sequelize.STRING,
        allowNull: false
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Legs');
  }
};
