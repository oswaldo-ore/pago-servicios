'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DetalleUsuarioFactura extends Model {
        static PENDIENTE = 0;
        static PRESTADO = 1;
        static COMPLETADO = 2;
        static associate(models) {
            DetalleUsuarioFactura.belongsTo(models.Servicio, { foreignKey: 'servicioid' });
            DetalleUsuarioFactura.belongsTo(models.Usuario, { foreignKey: 'usuarioid' });
            DetalleUsuarioFactura.belongsTo(models.Factura, { foreignKey: 'facturaid' });
        }
        toJSON() {
            return { ...this.get(), createdAt: undefined, updatedAt: undefined, deletedAt: undefined };
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
            visto: DataTypes.TINYINT,
            estado: DataTypes.TINYINT,
            monto_pago: DataTypes.DOUBLE,
            cambio_pago: DataTypes.DOUBLE,
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