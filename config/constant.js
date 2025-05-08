require("dotenv").config();
const VALIDATOR = require("validatorjs");
const JWT = require("jsonwebtoken");
const BCRYPT = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { Op, DataTypes, literal } = require('sequelize');

const VALIDATION_EVENTS = {
  LOGIN_ADMIN: "loginAdmin",
  CREATE_ADMIN: "createAdmin",
  FORGOT_PASSWORD: "forgotPassword",
  RESET_PASSWORD: "resetPassword",
  GET_ADMIN: "getAdmin",
  UPDATE_ADMIN: "updateAdmin",
  DELETE_ADMIN: "deleteAdmin",
  CHANGE_PASSWORD_ADMIN: "changePasswordAdmin",
  EDIT_ADMIN_BY_SUPER_ADMIN: "editAdminBySuperAdmin",
  USER_LOGIN_SOCIAL: "userLoginSocial",
  USER_SIGNUP_EMAIL: "userSignupEmail",
  USER_LOGIN_EMAIL: "userLoginEmail",
  USER_LOGIN_PHONE: "userLoginPhone",
  USER_LOGOUT: "userLogout",
  UPDATE_USER: "updateUser",
  VIEW_USER: "viewUser",
  UPDATE_USER_BY_ADMIN: "updateUserByAdmin",
  DELETE_USER: "deleteUser",
  AFTER_SET_PASSWORD: "afterSetPassword",
  VERIFY_LINK: "verifyLink",
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

const DEVICE_TYPE = {
  WEB: "web",
  ANDROID: "android",
  IOS: "ios",
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
  USER_ACCESS_TOKEN: '60m',
  USER_REFRESH_TOKEN: '30d',
  ADMIN_ACCESS_TOKEN: '1d',
  USER_FORGOT_PASSWORD_TOKEN: 900000, // 15 minutes
  ADMIN_FORGOT_PASSWORD_TOKEN: 5 * 60, // 5 minutes
};

const USER_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  USER: 'user',
};

module.exports = {
  VALIDATION_EVENTS,
  HTTP_STATUS_CODE,
  DEVICE_TYPE,
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
};
