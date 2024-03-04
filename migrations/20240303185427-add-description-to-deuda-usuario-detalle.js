'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('detalles_usuario_factura', 'description', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: "Registro del detalle de la factura",
    });
    await queryInterface.addColumn('detalles_usuario_factura', 'created_by_invoice', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '0: No, 1: Yes'
    });

    await queryInterface.addColumn('usuarios', 'balance', {
      type: Sequelize.DataTypes.DOUBLE,
      defaultValue:0,
      allowNull: false,
      comment: 'Saldo del usuario'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('detalles_usuario_factura', 'description');
    await queryInterface.removeColumn('detalles_usuario_factura', 'created_by_invoice');
    await queryInterface.removeColumn('usuarios', 'balance');
  }
};
