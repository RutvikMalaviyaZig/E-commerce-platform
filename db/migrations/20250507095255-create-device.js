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
    await queryInterface.createTable("device", {
      id: {
        type: Sequelize.STRING(40),
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
      deviceId: {
        type: Sequelize.TEXT,
        defaultValue: "",
      },
      deviceToken: {
        type: Sequelize.TEXT,
        defaultValue: "",
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "user", // Must match the actual table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      osType: {
        type: Sequelize.STRING(40),
        defaultValue: "",
      },
      refreshToken: {
        type: Sequelize.TEXT,
        defaultValue: "",
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
    await queryInterface.dropTable("device");
  }
};
