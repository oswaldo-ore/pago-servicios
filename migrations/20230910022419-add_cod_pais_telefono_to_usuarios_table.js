'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios','cod_pais',{
      type: Sequelize.STRING,
      allowNull:false,
      defaultValue:"",
    });
    await queryInterface.addColumn('usuarios','telefono',{
      type: Sequelize.STRING,
      allowNull:false,
      defaultValue:"",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'cod_pais');
    await queryInterface.removeColumn('usuarios', 'telefono');
  }
};
