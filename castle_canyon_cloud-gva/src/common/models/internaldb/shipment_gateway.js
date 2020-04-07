'use strict';

module.exports = (sequelize, DataTypes) => {
  const ShipmentGateway = sequelize.define('ShipmentGateway', {
      shipmentId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      gatewayId: {
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
    },
    {
      tableName: 'ShipmentsGateways'
    }
  );

  ShipmentGateway.associate = (models) => {
  };

  return ShipmentGateway;
};
