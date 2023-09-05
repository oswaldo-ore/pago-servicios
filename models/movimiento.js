'use strict';
const { Model } = require('sequelize');
const { Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Movimiento extends Model {
    static associate(models) {
      Movimiento.belongsTo(models.Usuario, { foreignKey: 'usuarioid' });
    }
  }
  Movimiento.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true,
    },
    usuarioid: {
      type: DataTypes.INTEGER,
    },
    monto: {
      type: DataTypes.DOUBLE,
    },
    descripcion: {
      allowNull: true,
      type: DataTypes.STRING
    },
    saldo_anterior: {
      type: DataTypes.DOUBLE,
    },
    a_cuenta: {
      type: DataTypes.DOUBLE,
    },
    fecha: {
      type: DataTypes.DATE,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Movimiento',
    tableName: "movimientos",
  });
  return Movimiento;
};