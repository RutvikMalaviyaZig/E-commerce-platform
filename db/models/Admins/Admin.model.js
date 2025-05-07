const { DataTypes } = require("../../config/constants");
const sequelize = require("../../../config/database");

const Admin = sequelize.define(
  'Admin',
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(40),
      defaultValue: '',
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(40),
      allowNull: true,
      values : ['superAdmin' , 'admin', 'user'],
      defaultValue : 'admin'
    },
    forgotPasswordToken: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    forgotPasswordTokenExpiry: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.BIGINT,
    },
    lastLogoutAt: {
      type: DataTypes.BIGINT,
    },
    authToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ...models.defaultAttributes,
  },

  {
    tableName: 'admin',
    freezeTableName: true,
    timestamps: true, // Use Sequelize's built-in timestamp handling
    hooks: {
      beforeUpdate: (device) => {
        device.updatedAt = Date.now(); // Update `updatedAt` manually in hook
      },
    },
  }
);



module.exports = Admin;
