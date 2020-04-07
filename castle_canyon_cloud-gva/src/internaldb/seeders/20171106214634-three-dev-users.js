'use strict';

const ccUser = require('cccommon/user');
const models = require('cccommon/models/internaldb');
const roleConst = require('cccommon/constant').role;
const now = new Date();
const config = {};
config[roleConst.name.deskAgent()] = {
  username: () => { return 'deskagent@localhost'; },
  password: () => { return 'deskagent'; }
};
config[roleConst.name.dockWorker()] = {
  username: () => { return 'dockworker@localhost'; },
  password: () => { return 'dockworker'; }
};
config.admin = {
  username: () => { return 'admin@localhost'; },
  password: () => { return 'admin'; }
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
  let deskAgentRole;
  let dockWorkerRole;

  /* STEP: COLLECT ROLE IDs CREATED BY A DIFFERENT, MANDATORY SEEDER */

  deskAgentRole = await models.Role.findOne({attributes: ['id'], where: {name: 'Desk Agent'}});
  if (!deskAgentRole) {
    throw new Error('Desk Agent role missing, run the roles seeder before this one');
  }

  dockWorkerRole = await models.Role.findOne({attributes: ['id'], where: {name: 'Dock Worker'}});
  if (!dockWorkerRole) {
    throw new Error('Dock Worker role missing, run the roles seeder before this one');
  }

  /* STEP: CREATE THE DESK AGENT USER & ASSIGN ITS ROLE */

  email = config[roleConst.name.deskAgent()].username();
  password = config[roleConst.name.deskAgent()].password();
  await models.User.create({
    email: email,
    password: ccUser.genPasswordSync(password),
    token: '',
    createdAt: now,
    updatedAt: now
  });
  user = await models.User.findOne({attributes: ['id'], where: {email: email}});
  if (!user) {
    throw new Error('failed to create desk agent dev user');
  }

  await user.addRole(deskAgentRole);

  /* STEP: CREATE THE DOCK WORKER USER & ASSIGN ITS ROLE */

  email = config[roleConst.name.dockWorker()].username();
  password = config[roleConst.name.dockWorker()].password();
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

  /* STEP: CREATE THE "ADMIN" USER & ASSIGN ITS ROLES */

  email = config.admin.username();
  password = config.admin.password();
  await models.User.create({
    email: email,
    password: ccUser.genPasswordSync(password),
    token: '',
    createdAt: now,
    updatedAt: now
  });
  user = await models.User.findOne({attributes: ['id'], where: {email: email}});
  if (!user) {
    throw new Error('failed to create admin dev user');
  }

  await user.addRoles([deskAgentRole, dockWorkerRole]);

  return Sequelize.Promise.resolve();
}

async function down(queryInterFace, Sequelize) {
  const Op = Sequelize.Op;

  let users;

  users = await models.User.findAll({
    attributes: ['id'],
    where: {
      email: { [Op.like]: '%localhost' }
    }
  });
  if (!users.length) {
    throw new Error('no dev users found');
  }

  const userIds = [];
  for (let u of users) {
    userIds.push(u.id);
  }

  await models.UserRole.destroy({
    where: {
      userId: { [Op.in]: userIds }
    }
  });

  await models.User.destroy({
    where: {
      id: { [Op.in]: userIds }
    }
  });

  return Sequelize.Promise.resolve();
}
