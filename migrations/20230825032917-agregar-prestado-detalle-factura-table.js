'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('detalles_usuario_factura', 'isprestado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue:false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('detalles_usuario_factura', 'isprestado');
  }
};
