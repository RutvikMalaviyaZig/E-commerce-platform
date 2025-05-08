const { DataTypes } = require("../../../config/constant");
const sequelize = require("../../../config/database");
const  Media  = require('../Media/Media');

const User = sequelize.define(
  "User",
  {
    socialMediaId: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    loginWith: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    loginMethod: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    authToken: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    role: {
      type: DataTypes.STRING(40),
      allowNull: true,
      values : ['superAdmin' , 'admin', 'user'],
      defaultValue : "user"
    },
    name: {
      type: DataTypes.STRING(40),
      defaultValue: "",
    },
    gender: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    dateOfBirth: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    age: {
      type: DataTypes.BIGINT,
    },
    email: {
      type: DataTypes.STRING(40),
      defaultValue: "",
    },
    phone: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    lastLoginAt: {
      type: DataTypes.BIGINT,
    },
    lastLogoutAt: {
      type: DataTypes.BIGINT,
    },
    profileImageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Media,
        key: "id",
      },
    },
    forgotPasswordToken: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    forgotPasswordTokenExpiry: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "user",
    freezeTableName: true,
    timestamps: true, // Use Sequelize's built-in timestamp handling
    hooks: {
      beforeUpdate: (device) => {
        device.updatedAt = Date.now(); // Update `updatedAt` manually in hook
      },
    },
  }
);

module.exports = User;
