'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_role_name'
      }
    },
  });
};
