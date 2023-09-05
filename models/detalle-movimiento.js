'use strict';

const { Model } = require('sequelize');
const { Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DetalleMovimiento extends Model {
    static associate(models) {
      DetalleMovimiento.belongsTo(models.DetalleUsuarioFactura, { foreignKey: 'detalleusuariofacturaid' });
    }
  }
  DetalleMovimiento.init({
    id:{
      type: DataTypes.INTEGER,
      primaryKey:true,
    },
    detalleusuariofacturaid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'detalles_usuario_factura',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    movimientoid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'movimientos',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    monto: {
      type: DataTypes.DOUBLE,
    },
    descripcion: {
      allowNull: true,
      type: DataTypes.STRING
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
    modelName: 'DetalleMovimiento',
    tableName: "detalle_movimiento",
  });
  return DetalleMovimiento;
};