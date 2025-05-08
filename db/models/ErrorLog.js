const { DataTypes } = require('../../config/constant');
const  sequelize  = require('../../config/database');

const ErrorLog = sequelize.define(
  'ErrorLog',
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
    api: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
    errorDetail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },

  {
    tableName: 'error_log',
    freezeTableName: true,
    timestamps: true, // Use Sequelize's built-in timestamp handling
    hooks: {
      beforeUpdate: (device) => {
        device.updatedAt = Date.now(); // Update `updatedAt` manually in hook
      },
    },
  }
);

module.exports = ErrorLog;
