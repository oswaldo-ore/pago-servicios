"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("configuraciones", "veripagos_secret_key", {
      type: Sequelize.STRING,
      defaultValue: "",
    });
    await queryInterface.addColumn("configuraciones", "veripagos_username", {
      type: Sequelize.STRING,
      defaultValue: "",
    });
    await queryInterface.addColumn("configuraciones", "admin_id", {
      type: Sequelize.INTEGER,
      references: {
        model: {
          tableName: 'admins',
        },
        key: 'id'
      },
      defaultValue: 1,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "configuraciones",
      "veripagos_secret_key"
    );
    await queryInterface.removeColumn("configuraciones", "veripagos_username");
    await queryInterface.removeConstraint("configuraciones", "configuraciones_admin_id_foreign_idx");
    await queryInterface.removeColumn("configuraciones", "admin_id");
  },
};
