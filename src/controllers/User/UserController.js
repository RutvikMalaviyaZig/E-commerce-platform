const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
  Op,
  LOGIN_WITH
} = require("../../../config/constant");
const { validateUserAuth } = require("../../validation/UserAuthValidation");
const { generateError } = require("../../helper/error/generateError");
const { calculateAge } = require("../../helper/ageCalculation/ageCalculation");
const User = require("../../../db/models/Users/User");
const Media = require("../../../db/models/Media/Media");

module.exports = {
  /**
   * @name getProfile
   * @file UserController.js
   * @param {Request} req
   * @param {Response} res
   * @description get user progile with userId
   * @author Rutvik Malaviya
   */

  getProfile: async (req, res) => {
    try {
      const userDetails = {
        id: req.query.id,
        eventCode: VALIDATION_EVENTS.VIEW_ADMIN,
      };
      // Perform validation
      const validationResult = validateUserAuth(userDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }
      //find requested Disease details from db
      const findUser = await User.findOne({
        where: {
          id: userDetails.id,
          isDeleted: false,
        },
        attributes: {
          exclude: [
            "lastLoginAt",
            "lastLogoutAt",
            "createdAt",
            "updatedAt",
            "deletedAt",
            "isDeleted",
          ],
        },
        include: [
          //for media table
          {
            model: Media,
            attributes: ['id', 'url', 'originalName'],
            as: 'mediaDetails',
            required: false,
            where: {
              isDeleted: false,
            },
          },
        ],
      });

      if (!findUser) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__('User.Auth.NotFound'),
          data: '',
          error: '',
        });
      }
      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: '',
        data: findUser,
        error: '',
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "UserController - getProfile",
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
   * @name editProfile
   * @file UserController.js
   * @param {Request} req
   * @param {Response} res
   * @description edit user progile with new user given data
   * @author Rutvik Malaviya
   */

  editProfile: async (req, res) => {
    try {
      const userDetails = {
        id: req.headers.userData.id,
        name: req.body.name,
        email: req.body.email ? req.body.email.toLowerCase() : '',
        phone: req.body.phone,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        countryCode: req.body.countryCode,
        profileImageId: req.body.profileImageId || null,
        loginWith: req.body.loginWith,
        eventCode: VALIDATION_EVENTS.UPDATE_USER,
      };
      // Perform validation
      const validationResult = validateUserAuth(userDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }
      //find requested Disease details from db
      const findUser = await User.findOne({
        where: {
          id: userDetails.id,
          isDeleted: false,
        },
        attributes: {
          exclude: [
            "lastLoginAt",
            "lastLogoutAt",
            "createdAt",
            "updatedAt",
            "deletedAt",
            "isDeleted",
          ],
        },
        include: [
          //for media table
          {
            model: Media,
            attributes: ['id', 'url', 'originalName'],
            as: 'mediaDetails',
            required: false,
            where: {
              isDeleted: false,
            },
          },
        ],
      });

      if (!findUser) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__('User.Auth.NotFound'),
          data: '',
          error: '',
        });
      }

      if (userDetails.email || userDetails.phone) {
        let existingUserWhere = {
          id: { [Op.ne]: userDetails.id },
          isDeleted: false,
        };

        if (userDetails.email) {
          existingUserWhere.email = userDetails.email;
        }
        if (userDetails.phone) {
          existingUserWhere.phone = userDetails.phone;
        }

        const existingUser = await User.findOne({
          where: existingUserWhere,
        });

        if (existingUser) {
          return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            status: HTTP_STATUS_CODE.BAD_REQUEST,
            message: req.__('User.Auth.UserAlreadyExist'),
            data: {},
            error: '',
          });
        }
      }

      // Check the login method and conditionally delete fields
      if (findUser.dataValues.loginWith === LOGIN_WITH.PHONE) {
        delete userDetails.phone;
        delete userDetails.countryCode;
      } else if (
        findUser.dataValues.loginWith === LOGIN_WITH.EMAIL ||
        (findUser.dataValues.loginWith === LOGIN_WITH.SOCIAL &&
          findUser.dataValues.loginMethod === LOGIN_METHOD.GOOGLE)
      ) {
        delete userDetails.email;
      }

      userDetails.age = calculateAge();

      // update user details
      await User.update(userDetails, {
        where: {
          id: userDetails.id,
          isDeleted: false,
        },
      });

      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: '',
        data: userDetails,
        error: '',
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "UserController - getProfile",
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
