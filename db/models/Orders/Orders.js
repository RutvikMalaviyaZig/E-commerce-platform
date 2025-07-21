const { DataTypes } = require("../../../config/constant");
const sequelize = require("../../../config/database");
const Address = require("../Address/Address");
const Product = require("../Product/Product");
const User = require("../Users/User");

const Order = sequelize.define(
  "Order",
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
        model: Product,
        key: "id",
      },
    },
    addressId: {
      type: DataTypes.STRING(40),
      allowNull: false,
      references: {
        model: Address,
        key: "id",
      },
    },
    totalPrice: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING(40),
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Stripe-related fields
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeSessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  {
    tableName: "order",
    freezeTableName: true,
    timestamps: true, // Use Sequelize's built-in timestamp handling
    hooks: {
      beforeUpdate: (device) => {
        device.updatedAt = Date.now(); // Update `updatedAt` manually in hook
      },
    },
  }
);

Order.belongsTo(Product, { foreignKey: "productId", as: "orderDetails" });
Product.hasMany(Order, { foreignKey: "productId", as: "ProductDetails" });

Order.belongsTo(Address, { foreignKey: "addressId", as: "addressDetails" });
Order.belongsTo(User, { foreignKey: "userId", as: "userDetails" });
module.exports = Order;
