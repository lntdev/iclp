'use strict';

module.exports = (sequelize, DataTypes) => {
  const Gateway = sequelize.define('Gateway', {
    uuid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    wsnId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    panId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    channelId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    beaconKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    microInterval: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    macroInterval: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  return Gateway;
};
