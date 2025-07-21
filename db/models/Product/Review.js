const { DataTypes } = require("../../../config/constant");
const sequelize = require("../../../config/database");
const User = require("../Users/User");
const Product = require("./Product");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.STRING(40),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    createdAt: {
      type: DataTypes.BIGINT,
      defaultValue: () => Date.now(), // Dynamically set the default value
    },
    updatedAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: () => Date.now(), // Dynamically set the default value
    },
    deletedAt: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    productId: {
      type: DataTypes.STRING(40),
      allowNull: false,
      references: {
        model: "product",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
    },
    rating: {
      type: DataTypes.ENUM(
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
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "review",
    freezeTableName: true,
    timestamps: true, // Use Sequelize's built-in timestamp handling
    hooks: {
      beforeUpdate: (device) => {
        device.updatedAt = Date.now(); // Update `updatedAt` manually in hook
      },
    },
  }
);

Product.hasMany(Review, {
  foreignKey: "productId",
  as: "reviews",
});
Review.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

User.hasMany(Review, {
  foreignKey: "userId",
  as: "reviews",
});
Review.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = Review;
