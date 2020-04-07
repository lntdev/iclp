'use strict';

const ccUser = require('cccommon/user');
const models = require('cccommon/models/internaldb');
const roleConst = require('cccommon/constant').role;
const now = new Date();
const config = {};
const devUserId = roleConst.name.dockWorker() + '-two';
config[devUserId] = {
  username: () => { return 'dockworker-two@localhost'; },
  password: () => { return 'dockworker-two'; }
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return up(queryInterface, Sequelize);
  },

  down: (queryInterface, Sequelize) => {
    return down(queryInterface, Sequelize);
  },

  // Export so tests can reuse them.
  config: () => { return config; }
};

async function up(queryInterFace, Sequelize) {
  let user;
  let role;
  let email, password;
  let dockWorkerRole;

  /* STEP: COLLECT ROLE IDs CREATED BY A DIFFERENT, MANDATORY SEEDER */

  dockWorkerRole = await models.Role.findOne({attributes: ['id'], where: {name: 'Dock Worker'}});
  if (!dockWorkerRole) {
    throw new Error('Dock Worker role missing, run the roles seeder before this one');
  }

  /* STEP: CREATE THE DOCK WORKER USER & ASSIGN ITS ROLE */

  email = config[devUserId].username();
  password = config[devUserId].password();
  await models.User.create({
    email: email,
    password: ccUser.genPasswordSync(password),
    token: '',
    createdAt: now,
    updatedAt: now
  });
  user = await models.User.findOne({attributes: ['id'], where: {email: email}});
  if (!user) {
    throw new Error('failed to create dock worker dev user');
  }

  await user.addRole(dockWorkerRole);

  return Sequelize.Promise.resolve();
}

async function down(queryInterFace, Sequelize) {
  const Op = Sequelize.Op

  let user = await models.User.findOne({
    attributes: ['id'],
    where: {
      email: 'dockworker-two@localhost'
    }
  });

  if (!user) {
    throw new Error('no dev user found');
  }

  await models.UserRole.destroy({
    where: {
      userId: user.get('id')
    }
  });

  await models.User.destroy({
    where: {
      id: { [Op.in]: user.get('id') }
    }
  });

  return Sequelize.Promise.resolve();
}
