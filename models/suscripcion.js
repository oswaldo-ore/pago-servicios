'use strict';

const { Model } = require('sequelize');
const { Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Suscripcion extends Model {
        static FIJO="fijo";
        static MEDIDOR="medidor";
        static CALCULAR="calcular";
        static associate(models) {
            Suscripcion.belongsTo(models.Usuario, { foreignKey: 'usuarioid' });
            Suscripcion.belongsTo(models.Servicio, { foreignKey: 'servicioid' });
        }
        toJSON() {
            // Oculta las columnas createdAt, updatedAt y deletedAt
            return { ...this.get(), id: this.id,createdAt: undefined, updatedAt: undefined, deletedAt: undefined };
          }
    }

    Suscripcion.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
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
            usuarioid: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'usuarios',
                    key: 'id',
                },
            },
            servicioid: {
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