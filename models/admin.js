'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static SECRET_KEY = "PAGO_SERVICIO_OSWALDO";
    static associate(models) {
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
  Admin.SECRET_KEY = "PAGO_SERVICIO_OSWALDO";

  return Admin;
};