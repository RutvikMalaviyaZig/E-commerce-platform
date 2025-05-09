"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("admin", {
      id: {
        type: Sequelize.STRING(40),
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(40),
        defaultValue: "",
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      role: {
        type: Sequelize.STRING(40),
        allowNull: true,
        defaultValue: "admin",
      },
      forgotPasswordToken: {
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      forgotPasswordTokenExpiry: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      lastLoginAt: {
        type: Sequelize.BIGINT,
      },
      lastLogoutAt: {
        type: Sequelize.BIGINT,
      },
      authToken: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
      updatedAt: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      profileImageId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "media", // Use table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("admin");
  },
};
