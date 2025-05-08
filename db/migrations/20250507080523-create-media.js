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
    await queryInterface.createTable("media", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      url: {
        type: Sequelize.STRING(255),
        defaultValue: "",
      },
      fileName: {
        type: Sequelize.STRING(255),
        defaultValue: "",
      },
      filePath: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      size: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contentType: {
        type: Sequelize.STRING(128),
        defaultValue: "",
      },
      originalName: {
        type: Sequelize.STRING(255),
        defaultValue: "",
      },
      mediaType: {
        type: Sequelize.STRING(15),
        defaultValue: "",
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
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("media");
  }
};
