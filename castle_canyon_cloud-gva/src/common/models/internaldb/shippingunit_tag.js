'use strict';

module.exports = (sequelize, DataTypes) => {
  const ShippingUnitTag = sequelize.define(
    'ShippingUnitTag',
    {
      shippingUnitId: DataTypes.INTEGER,
      tagId: DataTypes.INTEGER
    },
    {
      tableName: 'ShippingUnitsTags'
    }
  );

  ShippingUnitTag.associate = (models) => {
  };

  return ShippingUnitTag;
};
