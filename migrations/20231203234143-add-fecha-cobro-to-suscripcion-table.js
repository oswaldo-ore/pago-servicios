'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('suscripciones','fecha_deuda',{
      type: Sequelize.DATE,
      allowNull:true,
      defaultValue:null,
      comment:"Fecha de generacion de deudas",
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE suscripciones
      MODIFY COLUMN tipo ENUM('fijo', 'calcular', 'medidor', 'automatico') NOT NULL;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('suscripciones','fecha_deuda');
    await queryInterface.sequelize.query(`
      ALTER TABLE suscripciones
      MODIFY COLUMN tipo ENUM('fijo', 'calcular', 'medidor') NOT NULL;
    `);
  }
};
