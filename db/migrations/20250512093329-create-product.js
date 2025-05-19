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
    await queryInterface.createTable("product", {
      id: {
        type: Sequelize.STRING(40),
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
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
      categoryName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      productImageId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "media", // table name (NOT model name)
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      price: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      currencySymbol: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      productDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      rating: {
        type: Sequelize.ENUM(
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10"
        ),
        allowNull: true,
        defaultValue: null,
      },
      review: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: "",
      },
      specification: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      otherDetails: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      discount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      availableOffers: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable("product");
  },
};
