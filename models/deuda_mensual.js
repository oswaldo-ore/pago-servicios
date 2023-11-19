'use strict';

const { Model } = require('sequelize');
const { Sequelize } = require('sequelize');
const moment = require('moment');
require('moment/locale/es');
module.exports = (sequelize, DataTypes) => {

  class DeudaMensual extends Model {

    static associate(models) {
      DeudaMensual.hasMany(models.DetalleDeudaMensual, { foreignKey: 'deuda_mensual_id', as: "DetalleDeudaMensuales" });
      DeudaMensual.belongsTo(models.Usuario, { foreignKey: 'usuarioid' });
    }

    getFechaFormateada() {
      moment.locale('es'); // Configura el idioma a español
      const formattedDate = moment(this.fecha).format('MMMM-YYYY');
      const capitalizeFormattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
      return capitalizeFormattedDate;
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

  DeudaMensual.init(
    {
      monto: DataTypes.DOUBLE,
      monto_pago: DataTypes.DOUBLE,
      monto_debe: DataTypes.DOUBLE,
      usuarioid: DataTypes.INTEGER,
      fecha: DataTypes.DATEONLY,
      mes: DataTypes.STRING,
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
      modelName: 'DeudaMensual',
      tableName: 'deudas_mensuales',
      timestamps: true,
      paranoid: true,
    }
  );

  return DeudaMensual;
};