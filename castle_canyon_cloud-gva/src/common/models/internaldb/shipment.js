'use strict';

module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define('Shipment', {
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shipmentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uShipmentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_shipment_uShipmentId'
      }
    },
    shipmentName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingUnitCount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    referenceId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shipmentNote: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerAddrLine1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerAddrCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerAddrState: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerAddrPin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerAddrCountry: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerAddrPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    earliestPickup: {
      type: DataTypes.DATE,
      allowNull: false
    },
    latestDelivery: {
      type: DataTypes.DATE,
      allowNull: false
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tag2GwReportingTime: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gw2CloudReportingTime: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    surfaceOnly: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    statusLockUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    photoProofOfDeliveryUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    photoProofOfDeliveryNote: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    photoDocumentationUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    photoDocumentationNote: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    telemetryReportingTime: {
      type: DataTypes.DATE
    },
    telemetryLongitude: {
      type: DataTypes.DOUBLE
    },
    telemetryLatitude: {
      type: DataTypes.DOUBLE
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

  Shipment.associate = (models) => {
    Shipment.ShippingUnit = Shipment.hasMany(models.ShippingUnit, {
      foreignKey: 'shipmentId',
      as: 'shippingUnits'
    });

    Shipment.Leg = Shipment.hasMany(models.Leg, {
      foreignKey: 'shipmentId',
      as: 'legs'
    });

    Shipment.Geofence = Shipment.hasMany(models.Geofence, {
      foreignKey: 'shipmentId',
      as: 'geofences'
    });

    Shipment.StatusLockUser = Shipment.belongsTo(models.User, {
      foreignKey: 'statusLockUserId',
      targetKey: 'id',
      as: 'statusLockUser'
    });
  };

  return Shipment;
};
