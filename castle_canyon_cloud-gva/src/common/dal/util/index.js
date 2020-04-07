const models = require('cccommon/models/internaldb');
const sequelize = models.db;

exports.IN_TRANSACTION = async (dalMethod) => {
  return async (...dalMethodArgs) => {
    return await sequelize.transaction(async (t) => {
      const finaldalMethodArgs = [t];
      finalDalMethodArgs.push(...dalMethodArgs);
      return await dalMethod(finalDalMethodArgs);
    });
  }
};
