'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuarioid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      monto: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      descripcion:{
        type: Sequelize.TEXT,
        allowNull:true,
        defaultValue:"",
      },
      saldo_anterior: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      a_cuenta: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('movimientos');
  }
};
