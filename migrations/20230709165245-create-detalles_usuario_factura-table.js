'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detalles_usuario_factura', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      facturaid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'facturas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      monto: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      iscancelado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      fecha_pago: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notificar: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue:false,
      },
      visto: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: false,
      },
      monto_pago: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      cambio_pago: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
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
    await queryInterface.dropTable('detalles_usuario_factura');
  }
};
