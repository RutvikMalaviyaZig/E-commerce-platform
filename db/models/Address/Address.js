const { DataTypes } = require("../../../config/constant");
const sequelize = require("../../../config/database");
const User = require("../../models/Users/User");

const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    createdAt: {
      type: DataTypes.BIGINT,
      defaultValue: () => Date.now(),
    },
    updatedAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: () => Date.now(),
    },
    deletedAt: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    typeOfAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "address",
    freezeTableName: true,
    timestamps: false,
    hooks: {
      beforeUpdate: (address) => {
        address.updatedAt = Date.now();
      },
    },
  }
);

User.hasMany(Address, {
  foreignKey: "userId",
  as: "addresses",
});

Address.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
module.exports = Address;
