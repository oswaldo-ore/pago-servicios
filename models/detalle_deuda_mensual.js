'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DetalleDeudaMensual extends Model {
        static PENDIENTE = 0;
        static PRESTADO = 1;
        static COMPLETADO = 2;
        static associate(models) {
            DetalleDeudaMensual.belongsTo(models.Servicio, { foreignKey: 'servicioid' });
            DetalleDeudaMensual.belongsTo(models.Usuario, { foreignKey: 'usuarioid' });
            DetalleDeudaMensual.belongsTo(models.DeudaMensual, { foreignKey: 'deuda_mensual_id' });
        }
        toJSON() {
            return { ...this.get(), createdAt: undefined, updatedAt: undefined, deletedAt: undefined };
        }
    }

    DetalleDeudaMensual.init(
        {
            servicioid: DataTypes.INTEGER,
            usuarioid: DataTypes.INTEGER,
            deuda_mensual_id: DataTypes.INTEGER,
            monto: DataTypes.DOUBLE,
            monto_pago: DataTypes.DOUBLE,
            monto_debe: DataTypes.DOUBLE,
            fecha: DataTypes.DATEONLY,
            mes: DataTypes.STRING,
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
        },
        {
            sequelize,
            modelName: 'DetalleDeudaMensual',
            tableName: 'detalles_deudas_mensuales',
            timestamps: true,
            paranoid: true,
        }
    );

    return DetalleDeudaMensual;
};