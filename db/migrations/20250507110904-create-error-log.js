'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('error_log', {
      id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      createdAt: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
      updatedAt: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: Date.now(),
      },
      deletedAt: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      api: {
        type: Sequelize.STRING(255),
        defaultValue: '',
      },
      errorDetail: {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('error_log');
  }
};
