'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_user_email'
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  User.associate = (models) => {
    User.Role = models.User.belongsToMany(models.Role, {
      through: 'UserRole',
      foreignKey: 'userId',
      otherKey: 'roleId',
      as: 'roles'
    });
  };

  return User;
};
