
const { DataTypes } = require("../../../config/constant");
const sequelize = require("../../../config/database");
const Media = require('../../models/Media/Media')

const Product = sequelize.define(
  "Product",
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
    categoryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productImageId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Media,
        key: "id",
      },
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    currencySymbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.ENUM("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"),
      allowNull: true,
      defaultValue : null,
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue : '',
    },
    specification: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    otherDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    availableOffers: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },

  {
    tableName: "product",
    freezeTableName: true,
    timestamps: true, // Use Sequelize's built-in timestamp handling
    hooks: {
      beforeUpdate: (device) => {
        device.updatedAt = Date.now(); // Update `updatedAt` manually in hook
      },
    },
  }
);

Product.belongsTo(Media, {
  foreignKey: "productImageId",
  as: "mediaDetails",
});
Media.hasMany(Product, {
  foreignKey: "productImageId",
  as: "productDetails",
});

module.exports = Product;
