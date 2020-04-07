'use strict';

const models = require('cccommon/models/internaldb');
const now = new Date();

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [
      {
        name: 'Desk Agent',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Dock Worker',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return models.Role.destroy({
      where: {
        name: {
          [Op.like]: ['Desk Agent', 'Dock Worker']
        }
      }
    });
  }
};
