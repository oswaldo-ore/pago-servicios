'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('medidores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      cantidad_medido: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      mes: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      detalle: {
        type: Sequelize.STRING,
        allowNull: true,
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
      servicioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'servicios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('medidores');
  }
};
