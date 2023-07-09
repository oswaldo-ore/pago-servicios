'use strict';
const { Model } = require('sequelize');
const { Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Medidor extends Model {
    static associate(models) {
      Medidor.belongsTo(models.Servicio, { foreignKey: 'servicioId' });
      Medidor.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
    }
  }

  Medidor.init(
    {
      fecha: DataTypes.DATE,
      cantidad_medido: DataTypes.INTEGER,
      monto: DataTypes.DECIMAL(10, 2),
      mes: DataTypes.STRING,
      detalle: DataTypes.STRING,
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
      deletedAt: DataTypes.DATE,
      allowNull: true
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