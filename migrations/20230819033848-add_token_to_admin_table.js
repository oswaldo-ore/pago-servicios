'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('admins', 'token', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('admins', 'token');
  }
};
