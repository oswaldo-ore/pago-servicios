'use strict';

const { Model } = require('sequelize');
const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Factura extends Model {
    static associate(models) {
        Factura.belongsTo(models.Servicio, { foreignKey: 'servicioid' });  
    }

    toJSON() {
      return {
        ...this.get(),
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
      };
    }
  }

  Factura.init(
    {
      monto: DataTypes.DOUBLE,
      fecha: DataTypes.DATEONLY,
      foto_factura: DataTypes.STRING,
      notifico: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      visto: {
        type: DataTypes.INTEGER,
        fieldType: 'TINYINT',
        allowNull: false,
        defaultValue: 0,//no visto
      },
      servicioid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'servicios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Factura',
      tableName: 'facturas',
      timestamps: true,
      paranoid: true,
    }
  );

  return Factura;
};