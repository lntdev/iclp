'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define(
    'UserRole',
    {
      userId: DataTypes.INTEGER,
      roleId: DataTypes.INTEGER
    },
    {
      tableName: 'UsersRoles'
    }
  );

  UserRole.associate = (models) => {
  };

  return UserRole;
};
