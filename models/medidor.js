'use strict';
const { Model } = require('sequelize');
const { Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Medidor extends Model {
    static associate(models) {
      Medidor.belongsTo(models.Servicio, { foreignKey: 'servicioId' });
      Medidor.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
    }
    toJSON() {
      // Oculta las columnas createdAt, updatedAt y deletedAt
      return { ...this.get(), createdAt: undefined, updatedAt: undefined, deletedAt: undefined };
    }
  }

  Medidor.init(
    {
      fecha: DataTypes.DATE,
      cantidad_medido: DataTypes.INTEGER,
      monto: DataTypes.DECIMAL(10, 2),
      mes: DataTypes.STRING,
      detalle: DataTypes.STRING,
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id',
        },
      },
      servicioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'servicios',
            key: 'id',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Medidor',
      tableName: 'medidores',
      timestamps: true,
      paranoid: true,
    }
  );

  return Medidor;
};