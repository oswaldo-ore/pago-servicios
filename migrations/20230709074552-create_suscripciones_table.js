'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('suscripciones', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tipo: {
        type: Sequelize.ENUM('fijo', 'calcular', 'medidor'),
        allowNull: false,
      },
      monto: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      tiene_medidor: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      habilitado: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
      servicioid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'servicios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('suscripciones');
  }
};
