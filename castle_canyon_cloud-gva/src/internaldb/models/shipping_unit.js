'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ShippingUnit', {
    packageId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  });
};
