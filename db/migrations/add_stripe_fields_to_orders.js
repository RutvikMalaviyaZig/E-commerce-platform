"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("order", "stripePaymentIntentId", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("order", "stripeSessionId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("order", "stripePaymentIntentId");
    await queryInterface.removeColumn("order", "stripeSessionId");
  },
};
