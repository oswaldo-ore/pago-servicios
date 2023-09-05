'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('facturas', 'estado', {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue:0,
      comment:"0 pendiente 1 completado prestado 2 completado"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('facturas', 'estado');
  }
};
