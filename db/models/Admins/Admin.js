const { DataTypes } = require("../../../config/constant");
const sequelize = require("../../../config/database");
const Media = require("../Media/Media");

const Admin = sequelize.define(
  "Admin",
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(40),
      defaultValue: "",
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(40),
      allowNull: true,
      values: ["superAdmin", "admin", "user"],
      defaultValue: "admin",
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
    profileImageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Media,
        key: "id",
      },
    },
  },

  {
    tableName: "admin",
    freezeTableName: true,
    timestamps: true, // Use Sequelize's built-in timestamp handling
    hooks: {
      beforeUpdate: (device) => {
        device.updatedAt = Date.now(); // Update `updatedAt` manually in hook
      },
    },
  }
);

Admin.belongsTo(Media, {
  foreignKey: "profileImageId",
  as: "mediaDetails",
});
Media.hasMany(Admin, {
  foreignKey: "profileImageId",
  as: "adminProfiles",
});

module.exports = Admin;
