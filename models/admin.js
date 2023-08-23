'use strict';
const {
  Model
} = require('sequelize');
const { Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static SECRET_KEY = "PAGO_SERVICIO_OSWALDO";
    static associate(models) {
      Admin.hasMany(models.Token, { foreignKey: 'user_id' });
    }
  }
  Admin.init({
    nombre: DataTypes.STRING,
    apellidos: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    estado: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
    timestamps: true,
    paranoid: true,
  });

  return Admin;
};