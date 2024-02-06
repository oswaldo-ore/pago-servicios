"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("detalle_veripagos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      monto: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      mes: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deuda_usuario_factura_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "detalles_usuario_factura",
          key: "id",
        }
      },
      veripagos_instance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "veripagos_instance",
          key: "id",
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("detalle_veripagos");
  },
};
