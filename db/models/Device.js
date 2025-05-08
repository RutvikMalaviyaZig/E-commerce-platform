const { DataTypes } = require("../../config/constant");
const sequelize = require("../../config/database"); // Get your DB instance
const  User  = require("./Users/User");

const Device = sequelize.define(
  "Device",
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
    deviceId: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    deviceToken: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
    osType: {
      type: DataTypes.STRING(40),
      defaultValue: "",
    },
    refreshToken: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
  },
  {
    tableName: "device",
    freezeTableName: true,
    timestamps: true, // Use Sequelize's built-in timestamp handling
    hooks: {
      beforeUpdate: (device) => {
        device.updatedAt = Date.now(); // Update `updatedAt` manually in hook
      },
    },
  }
);

module.exports = Device;
