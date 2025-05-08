const { DataTypes } = require("../../../config/constant");
const sequelize = require("../../../config/database");

const Media = sequelize.define(
  "Media",
  {
    url: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    fileName: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    filePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    size: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    contentType: {
      type: DataTypes.STRING(128),
      defaultValue: "",
    },
    originalName: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    mediaType: {
      type: DataTypes.STRING(15),
      defaultValue: "",
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
    tableName: "media",
    freezeTableName: true,
    timestamps: true, // Use Sequelize's built-in timestamp handling
    hooks: {
      beforeUpdate: (device) => {
        device.updatedAt = Date.now(); // Update `updatedAt` manually in hook
      },
    },
  }
);

module.exports = Media;
