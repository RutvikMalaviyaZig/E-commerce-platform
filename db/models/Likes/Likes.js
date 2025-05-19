const { DataTypes } = require("../../../config/constant");
const sequelize = require("../../../config/database");
const Product = require("../Product/Product");
const User = require("../Users/User");

const Likes = sequelize.define(
  "Likes",
  {
    productId: {
      type: DataTypes.STRING(40),
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    isLike: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    id: {
      type: DataTypes.UUID,
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
  },
  {
    tableName: "likes",
    freezeTableName: true,
    timestamps: true, // Use Sequelize's built-in timestamp handling
    hooks: {
      beforeUpdate: (device) => {
        device.updatedAt = Date.now(); // Update `updatedAt` manually in hook
      },
    },
  }
);

// association
Likes.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
Likes.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

User.hasMany(Likes, {
  foreignKey: "userId",
  as: "likes",
});
Product.hasMany(Likes, {
  foreignKey: "productId",
  as: "likes",
});

module.exports = Likes;
