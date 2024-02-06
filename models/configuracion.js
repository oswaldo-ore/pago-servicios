"use strict";
const { Model } = require("sequelize");
const { Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Configuracion extends Model {
    toJSON() {
      return {
        ...this.get(),
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
        instancia_id:undefined,
      };
    }
  }
  Configuracion.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      codigo_pais: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      numero_telefono: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      instancia_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      veripagos_secret_key: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      veripagos_username: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      veripagos_password: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      admin_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "admins",
          },
          key: "id",
        },
      },
      estado_conexion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    },
    {
      sequelize,
      modelName: "Configuracion",
      tableName: "configuraciones",
      timestamps: true,
      paranoid: true,
    }
  );

  return Configuracion;
};
