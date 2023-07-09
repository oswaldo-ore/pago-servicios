'use strict';
const {
  Model
} = require('sequelize');
const { Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Servicio extends Model {

    static associate(models) {
      Servicio.hasMany(models.Medidor, { foreignKey: 'usuarioId' });
      Servicio.belongsToMany(models.Usuario, {
        through: models.Suscripcion,
        foreignKey: 'servicioid',
        otherKey: 'usuarioid',
      });
    }
    toJSON() {
      // Oculta las columnas createdAt, updatedAt y deletedAt
      return { ...this.get(), createdAt: undefined, updatedAt: undefined, deletedAt: undefined };
    }
  }
  Servicio.init({
    nombre: DataTypes.STRING,
    estado: DataTypes.BOOLEAN,
    asociar: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
      allowNull: true
    }
  },
    {
      sequelize,
      modelName: 'Servicio',
      tableName: 'servicios',
      timestamps: true,
      paranoid: true,
    });
  return Servicio;
};