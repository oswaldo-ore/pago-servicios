'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('detalle_movimiento', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      detalleusuariofacturaid: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'detalles_usuario_factura',
          },
          key: 'id'
        },
        allowNull: false
      },
      movimientoid: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'movimientos',
          },
          key: 'id'
        },
        allowNull: false
      },
      monto:{
        type: Sequelize.DOUBLE,
        allowNull:false,
      },
      descripcion:{
        type: Sequelize.TEXT,
        defaultValue:"",
      },
      fecha:{
        type: Sequelize.DATE,
        allowNull:false, 
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
    return queryInterface.dropTable('detalle_movimiento');
  }
};
