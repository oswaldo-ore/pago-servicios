'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("detalles_usuario_factura", "es_deuda_generada", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0 no es generado, 1 es generado",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("detalles_usuario_factura", "es_deuda_generada");
  }
};
