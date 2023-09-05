'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar campos existentes
    await queryInterface.removeColumn('detalles_usuario_factura', 'iscancelado');
    await queryInterface.removeColumn('detalles_usuario_factura', 'isprestado');

    // Agregar nuevo campo
    await queryInterface.addColumn('detalles_usuario_factura', 'estado', {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "0 pendiente, 1 prestado, 2 pagado",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('detalles_usuario_factura', 'iscancelado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.addColumn('detalles_usuario_factura', 'isprestado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.removeColumn('detalles_usuario_factura', 'estado');
  }
};
