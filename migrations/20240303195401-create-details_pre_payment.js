'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("details_pre_payment", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pre_payment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pre_payments",
          key: "id",
        },
      },
      detail_user_invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "detalles_usuario_factura",
          key: "id",
        },
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("details_pre_payment");
  }
};
