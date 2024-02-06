"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("usuarios", "configuracion_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: { model: "configuraciones", key: "id" },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("usuarios", "usuarios_configuracion_id_foreign_idx");
    await queryInterface.removeColumn("usuarios", "configuracion_id");
  },
};
