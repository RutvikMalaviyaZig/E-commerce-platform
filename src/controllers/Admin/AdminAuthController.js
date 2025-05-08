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
const { validateAdminAuth } = require("../../validation/AdminAuthValidation");
const { generateError } = require("../../helper/error/generateError");
const Admin = require("../../../db/models/Admins/Admin");

module.exports = {
  /**
   * @name signupWithEmail
   * @file AdminAuthController.js
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
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        password: req.body.password,
        eventCode: VALIDATION_EVENTS.ADMIN_SIGNUP_EMAIL,
      };

      // Perform validation
      const validationResult = validateAdminAuth(userData);

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

      const existingUserData = await Admin.findOne({
        where: {
          email: userData.email,
          isDeleted: false,
        },
        attributes: ["id"],
      });

      if (existingUserData) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Admin.Auth.UserAlreadyExists"),
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

      // create user
      let userAddData = await Admin.create({
        id: userId,
        name: userData.name,
        email: userData.email,
        password: hashPassword,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        age: userData.age,
        loginWith: userData.loginWith,
        authToken,
      });

      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: userAddData,
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminAuthController - signupWithEmail",
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
   * @file AdminAuthController.js
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
        eventCode: VALIDATION_EVENTS.ADMIN_LOGIN_EMAIL,
      };

      // Perform validation
      const validationResult = validateAdminAuth(authDetails);

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
      let userData = await Admin.findOne({
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
          message: req.__("Admin.Auth.InvalidCredential"),
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
          message: req.__("Admin.Auth.InvalidCredential"),
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

      await Admin.update(updateUserData, {
        where: {
          id: userData.id,
          isDeleted: false,
        },
      });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Admin.Auth.Login"),
        data: userData,
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminAuthController - loginWithEmail",
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
   * @file AdminAuthController.js
   * @param {Request} req
   * @param {Response} res
   * @description logout from the decvice
   * @author Rutvik Malaviya
   */

  logout: async (req, res) => {
    try {
      const { id } = req.headers.userData;

      // Perform validation
      const validationResult = validateAdminAuth({
        id,
        eventCode: VALIDATION_EVENTS.ADMIN_LOGOUT,
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

      // update authToken null
      await Admin.update(
        {
          authToken: "",
          lastLogoutAt: Date.now(),
        },
        {
          where: {
            id,
            isDeleted: false,
          },
        }
      );
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Admin.Auth.Logout"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminAuthController - logout",
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
