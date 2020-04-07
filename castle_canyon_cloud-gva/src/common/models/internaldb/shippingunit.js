'use strict';

module.exports = (sequelize, DataTypes) => {
  const ShippingUnit = sequelize.define('ShippingUnit', {
    shipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    packageId: {
      type: DataTypes.STRING,
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

  ShippingUnit.associate = (models) => {
    ShippingUnit.Shipment = ShippingUnit.belongsTo(models.Shipment, {
      foreignKey: 'shipmentId',
      as: 'shipments'
    });
    ShippingUnit.Tag = ShippingUnit.belongsToMany(models.Tag, {
      through: 'ShippingUnitTag',
      foreignKey: 'shippingUnitId',
      otherKey: 'tagId',
      as: 'tags'
    });
  };

  return ShippingUnit;
};
