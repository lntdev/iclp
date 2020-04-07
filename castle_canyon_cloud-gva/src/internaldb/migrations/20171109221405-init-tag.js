'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      wsnId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      temperatureMin: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      temperatureMax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      humidityMin: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      humidityMax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lightMin: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lightMax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      pressureMin: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      pressureMax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tiltMax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      shockMax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      batteryMin: {
        type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('Tags');
  }
};
