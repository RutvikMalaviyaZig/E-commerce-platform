const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
  USER_ROLES,
} = require("../../../config/constant");
const { validateAdmin } = require("../../validation/AdminValidation");
const { generateError } = require("../../helper/error/generateError");
const Media = require("../../../db/models/Media/Media");
const Admin = require("../../../db/models/Admins/Admin");
const User = require("../../../db/models/Users/User");

module.exports = {
  /**
   * @name getProfile
   * @file AdminController.js
   * @param {Request} req
   * @param {Response} res
   * @description get admin progile with id
   * @author Rutvik Malaviya
   */

  getProfile: async (req, res) => {
    try {
      const userDetails = {
        id: req.query.id,
        eventCode: VALIDATION_EVENTS.VIEW_ADMIN,
      };
      // Perform validation
      const validationResult = validateAdmin(userDetails);

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
      const findUser = await Admin.findOne({
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
            attributes: ["id", "url", "originalName"],
            as: "mediaDetails",
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
          message: req.__("User.Auth.NotFound"),
          data: "",
          error: "",
        });
      }
      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: findUser,
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminController - getProfile",
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
   * @file AdminController.js
   * @param {Request} req
   * @param {Response} res
   * @description edit Admin progile with new given data
   * @author Rutvik Malaviya
   */

  editProfile: async (req, res) => {
    try {
      const userDetails = {
        id: req.headers.userData.id,
        name: req.body.name,
        email: req.body.email ? req.body.email.toLowerCase() : "",
        phone: req.body.phone,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        countryCode: req.body.countryCode,
        profileImageId: req.body.profileImageId || null,
        eventCode: VALIDATION_EVENTS.UPDATE_ADMIN,
      };
      // Perform validation
      const validationResult = validateAdmin(userDetails);

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
      const findUser = await Admin.findOne({
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
            attributes: ["id", "url", "originalName"],
            as: "mediaDetails",
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
          message: req.__("Admin.Auth.NotFound"),
          data: "",
          error: "",
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
            message: req.__("User.Auth.UserAlreadyExist"),
            data: {},
            error: "",
          });
        }
      }

      // update user details
      await Admin.update(userDetails, {
        where: {
          id: userDetails.id,
          isDeleted: false,
        },
      });
      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: findUser,
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminController - editProfile",
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
   * @name deleteUserByAdminAndSuperAdmin
   * @file AdminController.js
   * @param {Request} req
   * @param {Response} res
   * @description delete User by admin or superAdmin
   * @author Rutvik Malaviya
   */

  deleteUserByAdminAndSuperAdmin: async (req, res) => {
    try {
      const userDetails = {
        id: req.headers.userData.id,
        userId: req.body.userId,
        eventCode: VALIDATION_EVENTS.DELETE_USER_BY_ADMIN_OR_SUPER_ADMIN,
      };
      // Perform validation
      const validationResult = validateAdmin(userDetails);

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
      const findUser = await Admin.findOne({
        where: {
          id: userDetails.id,
          isDeleted: false,
        },
        attributes: ["id"],
      });

      if (!findUser) {
        return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODE.UNAUTHORIZED,
          message: req.__("Admin.Auth.NotFound"),
          data: "",
          error: "",
        });
      }

      await User.update(
        { isDeleted: true, authToken: "" },
        {
          where: {
            id: userDetails.userId,
            isDeleted: false,
          },
        }
      );

      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Admin.Auth.UserDeleted"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminController - deleteUserByAdminAndSuperAdmin",
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
   * @name deleteUserOrAdminBySuperAdmin
   * @file AdminController.js
   * @param {Request} req
   * @param {Response} res
   * @description delete User or admin by superAdmin
   * @author Rutvik Malaviya
   */

  deleteUserOrAdminBySuperAdmin: async (req, res) => {
    try {
      const userDetails = {
        id: req.headers.userData.id,
        userId: req.body.userId,
        userRole: req.body.role, // this role for check which user we have to delete
        eventCode: VALIDATION_EVENTS.DELETE_USER_OR_ADMIN_BY_SUPER_ADMIN,
      };
      // Perform validation
      const validationResult = validateAdmin(userDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }
      // seperAdmin in db and check it role
      const findUser = await Admin.findOne({
        where: {
          id: userDetails.id,
          isDeleted: false,
        },
        attributes: ["id", "role"],
      });

      // if not found then send error
      if (!findUser) {
        return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODE.UNAUTHORIZED,
          message: req.__("Admin.Auth.NotFound"),
          data: "",
          error: "",
        });
      }

      // check role is superAdmin or not
      if (findUser.role != USER_ROLES.SUPER_ADMIN) {
        return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODE.UNAUTHORIZED,
          message: req.__("Admin.Auth.NotFound"),
          data: "",
          error: "",
        });
      }

      if (userDetails.userRole === USER_ROLES.ADMIN) {
        await Admin.destroy({
          where: {
            id: userDetails.userId,
            isDeleted: false,
          },
        });

        //return response
        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          message: req.__("Admin.Auth.AdminDeleted"),
          data: {},
          error: "",
        });
      }

      await User.update(
        { isDeleted: true, authToken: "" },
        {
          where: {
            id: userDetails.userId,
            isDeleted: false,
          },
        }
      );

      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Admin.Auth.UserDeleted"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminController - deleteUserByAdminAndSuperAdmin",
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
