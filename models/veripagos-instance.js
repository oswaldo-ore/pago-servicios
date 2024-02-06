"use strict";
const { Model, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VeripagosInstance extends Model {
    static associate(models) {
      VeripagosInstance.hasMany(models.DetalleVeripagos, {
        foreignKey: 'veripagos_instance_id',
        as: 'DetalleVeripagos',
      });
    }
  }

  VeripagosInstance.init(
    {
      movimiento_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      monto: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      completado_en: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "VeripagosInstance",
      tableName: "veripagos_instance",
      paranoid: true, // Para activar el soft delete
    }
  );

  return VeripagosInstance;
};
