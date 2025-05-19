const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
  UUID,
  LOGIN_WITH,
  Op,
  JWT,
  TOKEN_EXPIRY,
  BCRYPT,
} = require("../../../config/constant");
const { generateToken } = require("../../helper/Auth/generateToken");
const { calculateAge } = require("../../helper/ageCalculation/ageCalculation");
const { validateUserAuth } = require("../../validation/UserAuthValidation");
const { generateError } = require("../../helper/error/generateError");
const User = require("../../../db/models/Users/User");
const sequelize = require("../../../config/database");

module.exports = {
  /**
   * @name signupWithEmail
   * @file UserAuthController.js
   * @param {Request} req
   * @param {Response} res
   * @description User signup with email
   * @author Rutvik Malaviya
   */

  signupWithEmail: async (req, res) => {
    try {
      let userData = {
        name: req.body.name,
        email: req.body.email ? req.body.email.toLowerCase() : "",
        phone: req.body.phone,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        password: req.body.password,
        loginWith: LOGIN_WITH.EMAIL,
        countryCode: req.body.countryCode,
        eventCode: VALIDATION_EVENTS.USER_SIGNUP_EMAIL,
      };

      // Perform validation
      const validationResult = validateUserAuth(userData);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      userData.age = await calculateAge(userData.dateOfBirth);

      const existingUserData = await User.findOne({
        where: {
          email: userData.email,
          isDeleted: false,
        },
        attributes: ["id"],
      });

      if (existingUserData) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("User.Auth.UserAlreadyExists"),
          data: {},
          error: "",
        });
      }

      // if all field is fullfield the generate hash password
      const salt = BCRYPT.genSaltSync(10);
      const hashPassword = BCRYPT.hashSync(userData.password, salt);

      //generate userId
      const userId = UUID();
      // create payload
      const payload = {
        id: userId,
        email: userData.email,
        loginWith: userData.loginWith,
        dob: userData.dateOfBirth,
        createdAt: Date.now(),
      };

      // This code is generating authToken
      const authToken = await generateToken(
        payload,
        TOKEN_EXPIRY.USER_ACCESS_TOKEN
      );

      //creation of data
      await sequelize.transaction(async (transaction) => {
        // create user
        await User.create(
          {
            id: userId,
            name: userData.name,
            email: userData.email,
            password: hashPassword,
            phone: userData.phone,
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth,
            age: userData.age,
            loginWith: userData.loginWith,
            authToken,
          },
          { transaction }
        );
      });

      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "UserAuthController - signupWithEmail",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name loginWithEmail
   * @file UserAuthController.js
   * @param {Request} req
   * @param {Response} res
   * @description User login with email
   * @author Rutvik Malaviya
   */

  loginWithEmail: async (req, res) => {
    try {
      const authDetails = {
        email: req.body.email.toLowerCase(),
        password: req.body.password,
        eventCode: VALIDATION_EVENTS.USER_LOGIN_EMAIL,
      };

      // Perform validation
      const validationResult = validateUserAuth(authDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      // find user details with match credentials
      let userData = await User.findOne({
        where: {
          email: authDetails.email,
          isDeleted: false,
        },
        attributes: ["id", "authToken", "password"],
      });
      // if not then show error
      if (!userData) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("User.Auth.InvalidCredential"),
          data: {},
          error: "",
        });
      }

      // compare password in databse with given password
      const isPasswordValid = BCRYPT.compareSync(
        authDetails.password,
        userData.password
      );

      // show error if password not math
      if (!isPasswordValid) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("User.Auth.InvalidCredential"),
          data: {},
          error: "",
        });
      }

      // create payload
      const payload = {
        id: userData.id,
        email: authDetails.email,
        createdAt: Date.now(),
      };

      let updateUserData = {
        lastLoginAt: Date.now(),
        loginWith: LOGIN_WITH.EMAIL,
      };

      //verify jwt token based on jwt key
      let decodedToken = JWT.decode(userData.authToken);

      if (
        !userData.authToken ||
        !decodedToken ||
        (decodedToken.exp && decodedToken.exp < Math.floor(Date.now() / 1000))
      ) {
        // This code is generating authToken
        updateUserData.authToken = await generateToken(
          payload,
          TOKEN_EXPIRY.USER_ACCESS_TOKEN
        );
        userData.dataValues.authToken = updateUserData.authToken;
      }

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await User.update(updateUserData, {
          where: {
            id: userData.id,
            isDeleted: false,
          },
          transaction,
        });
      });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("User.Auth.Login"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "UserAuthController - loginWithEmail",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name loginWithPhone
   * @file UserAuthController.js
   * @param {Request} req
   * @param {Response} res
   * @description User login with phone number
   * @author Rutvik Malaviya
   */

  loginWithPhone: async (req, res) => {
    try {
      const authDetails = {
        phone: req.body.phone,
        password: req.body.password,
        eventCode: VALIDATION_EVENTS.USER_LOGIN_PHONE,
      };

      // Perform validation
      const validationResult = validateUserAuth(authDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      let userData = await User.findOne({
        where: {
          phone: authDetails.phone,
          isDeleted: false,
        },
        attributes: ["id", "authToken", "password"],
      });

      if (!userData) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("User.Auth.InvalidCredential"),
          data: {},
          error: "",
        });
      }

      // compare password in databse with given password
      const isPasswordValid = BCRYPT.compareSync(
        authDetails.password,
        userData.password
      );
      // show error if password not math
      if (!isPasswordValid) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("User.Auth.InvalidCredential"),
          data: {},
          error: "",
        });
      }

      const payload = {
        id: userData.id,
        phone: authDetails.phone,
        loginWith: LOGIN_WITH.PHONE,
        createdAt: Date.now(),
      };

      let updateUserData = {
        lastLoginAt: Date.now(),
        loginWith: LOGIN_WITH.PHONE,
      };

      //verify jwt token based on jwt key
      let decodedToken = JWT.decode(userData.authToken);

      if (
        !userData.authToken ||
        !decodedToken ||
        (decodedToken.exp && decodedToken.exp < Math.floor(Date.now() / 1000))
      ) {
        // This code is generating authToken
        updateUserData.authToken = await generateToken(
          payload,
          TOKEN_EXPIRY.USER_ACCESS_TOKEN
        );
        userData.dataValues.authToken = updateUserData.authToken;
      }
      //creation of data
      await sequelize.transaction(async (transaction) => {
        await User.update(updateUserData, {
          where: {
            id: userData.id,
            isDeleted: false,
          },
          transaction,
        });
      });
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("User.Auth.Login"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "UserAuthController - loginWithEmail",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },
  /**
   * @name logoout
   * @file UserAuthController.js
   * @param {Request} req
   * @param {Response} res
   * @description logout from the decvice
   * @author Rutvik Malaviya
   */

  logout: async (req, res) => {
    try {
      const { id } = req.headers.userData;
      // Perform validation
      const validationResult = validateUserAuth({
        id,
        eventCode: VALIDATION_EVENTS.USER_LOGOUT,
      });

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      //creation of data
      await sequelize.transaction(async (transaction) => {
        // update authToken null
        await User.update(
          {
            authToken: "",
            lastLogoutAt: Date.now(),
          },
          {
            where: {
              id,
              isDeleted: false,
            },
            transaction,
          }
        );
      });
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("User.Auth.Logout"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "UserAuthController - logout",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name deleteAccount
   * @file UserAuthController.js
   * @param {Request} req
   * @param {Response} res
   * @description delete user account(soft delete)
   * @author Rutvik Malaviya
   */

  deleteAccount: async (req, res) => {
    try {
      const { id } = req.headers.userData;
      //creation of data
      await sequelize.transaction(async (transaction) => {
        await User.update(
          {
            isDeleted: true,
            deletedAt: Date.now(),
            authToken: "",
          },
          {
            where: {
              id,
              isDeleted: false,
            },
            transaction,
          }
        );
      });
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("User.Auth.DeleteSelf"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "UserAuthController - deleteAccount",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },
};
