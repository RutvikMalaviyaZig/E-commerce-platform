require("dotenv").config();
const VALIDATOR = require("validatorjs");
const JWT = require("jsonwebtoken");
const BCRYPT = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { Op, DataTypes, literal } = require("sequelize");
const FS = require("fs");
const MULTER = require("multer");
const PATH = require("path");

const VALIDATION_EVENTS = {
  LOGIN_ADMIN: "loginAdmin",
  CREATE_ADMIN: "createAdmin",
  CREATE_ADMIN_OR_USER: "createAdminOrUser",
  FORGOT_PASSWORD: "forgotPassword",
  RESET_PASSWORD: "resetPassword",
  GET_ADMIN: "getAdmin",
  UPDATE_ADMIN: "updateAdmin",
  DELETE_ADMIN: "deleteAdmin",
  CHANGE_PASSWORD_ADMIN: "changePasswordAdmin",
  EDIT_ADMIN_BY_SUPER_ADMIN: "editAdminBySuperAdmin",
  USER_LOGIN_SOCIAL: "userLoginSocial",
  USER_SIGNUP_EMAIL: "userSignupEmail",
  ADMIN_SIGNUP_EMAIL: "adminSignupEmail",
  USER_LOGIN_EMAIL: "userLoginEmail",
  ADMIN_LOGIN_EMAIL: "adminLoginEmail",
  USER_LOGIN_PHONE: "userLoginPhone",
  USER_LOGOUT: "userLogout",
  ADMIN_LOGOUT: "adminLogout",
  UPDATE_USER: "updateUser",
  VIEW_USER: "viewUser",
  VIEW_ADMIN: "viewAdmin",
  UPDATE_USER_BY_ADMIN: "updateUserByAdmin",
  DELETE_USER: "deleteUser",
  DELETE_USER_BY_ADMIN_OR_SUPER_ADMIN: "deleteUserByAdminOrSuperAdmin",
  AFTER_SET_PASSWORD: "afterSetPassword",
  VERIFY_LINK: "verifyLink",
  DELETE_USER_OR_ADMIN_BY_SUPER_ADMIN: "deletedUserOrAdminBySuperAdmin",
  UPDATE_USER_BY_ADMIN_OR_SUPER_ADMIN: "updateUserByAdminOrSuperAdmin",
  UPDATE_USER_OR_ADMIN_BY_SUPER_ADMIN: "updateUserOrAdminBySuperAdmin",
  CREATE_USER_BY_ADMIN_OR_SUPER_ADMIN: "createUserOrAdminBySuperAdmin",

  // categories
  CREATE_CATEGORY: "createCategory",
  UPDATE_CATEGORY: "updateCategory",
  DELETE_CATEGORY: "deleteCategory",

  // product
  CREATE_PRODUCT: "createProduct",
  UPDATE_PRODUCT: "updateProduct",
  DELETE_PRODUCT: "deleteProduct",

  // Like
  LIKE_PRODUCT: "likeProduct",
  DISLIKE_PRODUCT: "dislikeProduct",

  // addres
  CREATE_ADDRESS: "createAddress",
  UPDATE_ADDRESS: "updateAddress",
  DELETE_ADDRESS: "deleteAddress",
};

// Response Codes
const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500,
};

const LOGIN_WITH = {
  PHONE: "phone",
  EMAIL: "email",
  SOCIAL: "social",
};

const GENDER = {
  MALE: "Male",
  FEMALE: "Female",
};

// JWT Expiry
const TOKEN_EXPIRY = {
  USER_ACCESS_TOKEN: "120m",
  USER_REFRESH_TOKEN: "30d",
  ADMIN_ACCESS_TOKEN: "1d",
  USER_FORGOT_PASSWORD_TOKEN: 900000, // 15 minutes
  ADMIN_FORGOT_PASSWORD_TOKEN: 5 * 60, // 5 minutes
};

const USER_ROLES = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  USER: "user",
};

const FILE_CONSTANTS = {
  TYPES: {
    IMAGE: {
      FLAG: "I",
      CONTENT_TYPES: ["image/png", "image/jpg", "image/jpeg"],
    },
    VIDEO: {
      FLAG: "V",
      CONTENT_TYPES: ["video/quicktime", "video/x-ms-wmv", "video/mp4"],
    },
  },
  UPLOAD: {
    PATH: "uploads/",
  },
  TEST: {
    PATH: "test/",
    SIZE: 10 * 1024 * 1024,
    CONTENT_TYPES: [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/svg+xml",
      "video/mp4",
    ],
  },
  MAX_SIZE: 1 * 1024 * 1024 * 1024, // 1 GB file size limit
};

module.exports = {
  VALIDATION_EVENTS,
  HTTP_STATUS_CODE,
  LOGIN_WITH,
  GENDER,
  VALIDATOR,
  JWT,
  BCRYPT,
  UUID: uuidv4,
  TOKEN_EXPIRY,
  Op,
  DataTypes,
  literal,
  USER_ROLES,
  FILE_CONSTANTS,
  FS,
  MULTER,
  PATH,
};
