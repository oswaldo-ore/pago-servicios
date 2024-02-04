'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios','saldo',{
      type: Sequelize.DOUBLE,
      allowNull:false,
      defaultValue:0,
      comment:"Saldo",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("usuarios", "saldo");
  }
};
