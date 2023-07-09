'use strict';
const {
  Model
} = require('sequelize');
const { Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Usuario.hasMany(models.Medidor, { foreignKey: 'usuarioId' });
      Usuario.hasMany(models.Suscripcion, { foreignKey: 'usuarioid' });
      Usuario.belongsToMany(models.Servicio, {
        through: models.Suscripcion,
        foreignKey: 'usuarioid',
        otherKey: 'servicioid',
      });
    }

    toJSON() {
      // Oculta las columnas createdAt, updatedAt y deletedAt
      return { ...this.get(), createdAt: undefined, updatedAt: undefined, deletedAt: undefined };
    }
  }
  Usuario.init({
    nombre: DataTypes.STRING,
    apellidos: DataTypes.STRING,
    estado: DataTypes.BOOLEAN,
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
    deletedAt:{
      type:DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    paranoid: true,
  });
  return Usuario;
};