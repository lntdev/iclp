'use strict';

module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    uuid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    wsnId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    temperatureIsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    temperatureMin: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    temperatureMax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    humidityIsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    humidityMin: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    humidityMax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lightIsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    lightMin: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lightMax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pressureIsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    pressureMin: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pressureMax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tiltIsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    tiltMax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shockIsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    shockMax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    batteryIsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    batteryMin: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Tag.associate = (models) => {
    // One of several associations among all the models that are intended to support "reverse"
    // look ups in order to (ultimately, in DAL functions) find shipments that currently
    // use a given tag (identified by UUID in the actual query).
    Tag.ShippingUnit = Tag.belongsToMany(models.ShippingUnit, {
      through: 'ShippingUnitTag',
      foreignKey: 'tagId',
      otherKey: 'shippingUnitId',
      as: 'shippingUnits'
    });
  };

  return Tag;
};
