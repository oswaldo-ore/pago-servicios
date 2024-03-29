"use strict";
const { Model } = require("sequelize");
const { Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static SECRET_KEY = "PAGO_SERVICIO_OSWALDO";
    static associate(models) {
      Admin.hasMany(models.Token, { foreignKey: "user_id" });
      Admin.hasOne(models.Configuracion, { foreignKey: "admin_id" });
    }
    toJSON() {
      return {
        ...this.get(),
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined
      };
    }
  }
  Admin.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: DataTypes.STRING,
      apellidos: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      estado: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Admin",
      tableName: "admins",
      timestamps: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ["createdAt","updatedAt"] }, // Excluir el campo 'password' por defecto
      },
      scopes: {
        withoutPassword: {
          attributes: { exclude: ['password',"createdAt","updatedAt"] }
        }
      }
    }
  );

  return Admin;
};
