'use strict';

module.exports = (sequelize, DataTypes) => {
  const Geofence = sequelize.define('Geofence', {
    shipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shape: {
      type: DataTypes.STRING,
      allowNull: false
    },
    coordinates: {
      type: DataTypes.STRING,
      allowNull: false,
      get: function () {
        if (this.getDataValue('coordinates'))
          return JSON.parse(this.getDataValue('coordinates'));
        else
          return null;
      },
      set: function (value) {
        this.setDataValue('coordinates', JSON.stringify(value));
      }
    },
    breachAction: {
      type: DataTypes.STRING,
      allowNull: false,
      get: function () {
        if (this.getDataValue('breachAction'))
          return JSON.parse(this.getDataValue('breachAction'));
        else
          return null;
      },
      set: function (value) {
        this.setDataValue('breachAction', JSON.stringify(value));
      }
    },
    alertStatus: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Geofence.associate = (models) => {
    Geofence.belongsTo(models.Shipment);
  };

  return Geofence;
};