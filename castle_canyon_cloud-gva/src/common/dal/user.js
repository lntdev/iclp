const ccUser = require('cccommon/user');
const models = require('cccommon/models/internaldb');

exports.coreInclude = () => {
  return [
    {
      association: models.User.Role
    }
  ];
};

exports.findByCred = (email, rawPassword) => {
  return models.User.findOne({
    where: {
      email: email,
      password: ccUser.genPasswordSync(rawPassword)
    },
    include: exports.coreInclude()
  });
};

exports.findByEmail = (email) => {
  return models.User.findOne({
    where: {
      email: email
    },
    include: exports.coreInclude()
  });
};

exports.genToken = (user) => {
  return user.update({token: ccUser.genTokenSync()});
}

exports.findByToken = (token) => {
  return models.User.findOne({
    where: {token: token},
    include: exports.coreInclude()
  });
};

exports.destroyToken = (user) => {
  return user.update({token: ''});
};

exports.hasRole = (user, roleName) => {
  let found = false;

  for (let r of user.roles) {
    if (r.name == roleName) {
      found = true;
      break;
    }
  }

  return found;
};
