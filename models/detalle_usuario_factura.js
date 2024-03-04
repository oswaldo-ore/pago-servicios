'use strict';
const { Model } = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
    class DetalleUsuarioFactura extends Model {
        static PENDIENTE = 0;
        static PRESTADO = 1;
        static COMPLETADO = 2;
        static NO_GENERADO = 0;
        static GENERADO_AUTOMATICO = 1;
        static associate(models) {
            DetalleUsuarioFactura.belongsTo(models.Servicio, { foreignKey: 'servicioid' });
            DetalleUsuarioFactura.belongsTo(models.Usuario, { foreignKey: 'usuarioid' });
            DetalleUsuarioFactura.belongsTo(models.Factura, { foreignKey: 'facturaid' });
        }
        toJSON() {
            return { ...this.get(), createdAt: undefined, updatedAt: undefined, deletedAt: undefined };
        }
        getFechaFormateada() {
            moment.locale('es'); // Configura el idioma a español
            const formattedDate = moment(this.fecha).format('MMMM-YYYY');
            const capitalizeFormattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
            return capitalizeFormattedDate;
          }
    }

    DetalleUsuarioFactura.init(
        {
            servicioid: DataTypes.INTEGER,
            usuarioid: DataTypes.INTEGER,
            facturaid: DataTypes.INTEGER,
            monto: DataTypes.DOUBLE,
            fecha: DataTypes.DATEONLY,
            fecha_pago: DataTypes.DATE,
            notificar: DataTypes.BOOLEAN,
            // iscancelado: DataTypes.BOOLEAN,
            // isprestado:DataTypes.BOOLEAN,
            description: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "Registro del detalle de la factura",
            },
            created_by_invoice: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
                comment: '0: No, 1: Yes'
            },
            visto: DataTypes.TINYINT,
            estado: DataTypes.TINYINT,
            monto_pago: DataTypes.DOUBLE,
            cambio_pago: DataTypes.DOUBLE,
            es_deuda_generada:{
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "0 no es generado, 1 es generado",
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
        },
        {
            sequelize,
            modelName: 'DetalleUsuarioFactura',
            tableName: 'detalles_usuario_factura',
            timestamps: true,
            paranoid: true,
        }
    );

    return DetalleUsuarioFactura;
};