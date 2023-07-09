'use strict';

const { Model } = require('sequelize');
const { Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Suscripcion extends Model {
        static associate(models) {
            Suscripcion.belongsTo(models.Usuario, { foreignKey: 'usuarioid' });
            Suscripcion.belongsTo(models.Servicio, { foreignKey: 'servicioid' });
        }
        toJSON() {
            // Oculta las columnas createdAt, updatedAt y deletedAt
            return { ...this.get(), createdAt: undefined, updatedAt: undefined, deletedAt: undefined };
          }
    }

    Suscripcion.init(
        {
            tipo: {
                type: DataTypes.ENUM('fijo', 'calcular', 'medidor'),
                allowNull: false,
            },
            monto: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            tiene_medidor: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            habilitado: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
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
            }
        },
        {
            sequelize,
            modelName: 'Suscripcion',
            tableName: 'suscripciones',
            timestamps: true,
            paranoid: true,
        }
    );

    return Suscripcion;
};