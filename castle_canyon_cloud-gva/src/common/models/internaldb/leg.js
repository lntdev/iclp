'use strict';

module.exports = (sequelize, DataTypes) => {
  const Leg = sequelize.define('Leg', {
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // In a future iteration, this should probably be something like `fromAddrId`
    // and point to a distinct address entity. That normalization was not performed
    // for the December demo for expediency and due to the demo constraint of having
    // no chain-of-custody changes, so each shipment's entire route can be represented
    // in one leg.
    fromLabel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fromLine1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fromCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fromState: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fromPin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fromCountry: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fromPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },

    toLabel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    toLine1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    toCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    toState: {
      type: DataTypes.STRING,
      allowNull: false
    },
    toPin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    toCountry: {
      type: DataTypes.STRING,
      allowNull: false
    },
    toPhone: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Leg.associate = (models) => {
    Leg.belongsTo(models.Shipment);
  };

  return Leg;
};
