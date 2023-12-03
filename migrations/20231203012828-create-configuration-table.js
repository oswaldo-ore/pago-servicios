"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("configuraciones", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      codigo_pais: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "+591",
      },
      numero_telefono: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      instancia_id: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
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
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("configuraciones");
  },
};
