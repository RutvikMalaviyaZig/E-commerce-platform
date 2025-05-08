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

    await queryInterface.createTable("user", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      socialMediaId: {
        type: Sequelize.TEXT,
        defaultValue: "",
      },
      loginWith: {
        type: Sequelize.STRING(20),
        defaultValue: "",
      },
      loginMethod: {
        type: Sequelize.STRING(20),
        defaultValue: "",
      },
      authToken: {
        type: Sequelize.TEXT,
        defaultValue: "",
      },
      role: {
        type: Sequelize.STRING(40),
        allowNull: true,
        defaultValue: "user",
      },
      name: {
        type: Sequelize.STRING(40),
        defaultValue: "",
      },
      gender: {
        type: Sequelize.STRING(20),
        defaultValue: "",
      },
      dateOfBirth: {
        type: Sequelize.STRING(20),
        defaultValue: "",
      },
      age: {
        type: Sequelize.BIGINT,
      },
      email: {
        type: Sequelize.STRING(40),
        defaultValue: "",
      },
      phone: {
        type: Sequelize.STRING(20),
        defaultValue: "",
      },
      lastLoginAt: {
        type: Sequelize.BIGINT,
      },
      lastLogoutAt: {
        type: Sequelize.BIGINT,
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
      forgotPasswordToken: {
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      forgotPasswordTokenExpiry: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
      updatedAt: {
        type: Sequelize.BIGINT,
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
      password : {
        type: Sequelize.STRING,
        allowNull: true,
      },
      countryCode: {
      type: DataTypes.STRING(5),
      allowNull: true,
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

    await queryInterface.dropTable("user");
  }
};
