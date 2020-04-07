'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable('Geofences', {      
     id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      latitude: {
        type: Sequelize.STRING,
        allowNull: false
      },
      longitude: {
        type: Sequelize.STRING,
        allowNull: false
      },
      radius: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fenceType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      alertStatus: {
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
      return queryInterface.dropTable('Geofences');
  }
};
