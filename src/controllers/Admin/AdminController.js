const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
  USER_ROLES,
  Op,
  UUID,
  BCRYPT,
} = require("../../../config/constant");
const { validateAdmin } = require("../../validation/AdminValidation");
const { generateError } = require("../../helper/error/generateError");
const Media = require("../../../db/models/Media/Media");
const Admin = require("../../../db/models/Admins/Admin");
const User = require("../../../db/models/Users/User");
const { calculateAge } = require("../../helper/ageCalculation/ageCalculation");
const sequelize = require("../../../config/database");

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
      //find requested admin details from db
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
      //find requested admin details from db
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

      //creation of data
      await sequelize.transaction(async (transaction) => {
        // update user details
        await Admin.update(userDetails, {
          where: {
            id: userDetails.id,
            isDeleted: false,
          },
          transaction,
        });
      });
      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Admin.Auth.AdminUpdated"),
        data: "",
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
      //find requested admin details from db
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

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await User.update(
          { isDeleted: true, authToken: "", deletedAt: Date.now() },
          {
            where: {
              id: userDetails.userId,
              isDeleted: false,
            },
            transaction,
          }
        );
      });
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
        //creation of data
        await sequelize.transaction(async (transaction) => {
          await Admin.destroy({
            where: {
              id: userDetails.userId,
              isDeleted: false,
            },
            transaction,
          });
        });

        //return response
        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          message: req.__("Admin.Auth.AdminDeleted"),
          data: {},
          error: "",
        });
      }

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await User.update(
          { isDeleted: true, authToken: "", deletedAt: Date.now() },
          {
            where: {
              id: userDetails.userId,
              isDeleted: false,
            },
            transaction,
          }
        );
      });

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
   * @name editUserOrAdminBySuperAdmin
   * @file AdminController.js
   * @param {Request} req
   * @param {Response} res
   * @description edit User or admin by superAdmin
   * @author Rutvik Malaviya
   */

  editUserOrAdminBySuperAdmin: async (req, res) => {
    try {
      const userDetails = {
        id: req.headers.userData.id,
        userId: req.body.userId,
        userRole: req.body.role, // this role for check superAdmin
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        countryCode: req.body.countryCode,
        eventCode: VALIDATION_EVENTS.UPDATE_USER_OR_ADMIN_BY_SUPER_ADMIN,
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

      // check role is admin or not
      if (
        userDetails.userRole === (USER_ROLES.SUPER_ADMIN || USER_ROLES.ADMIN)
      ) {
        // find old details of admin
        const checkAdminInDb = await Admin.findOne({
          where: {
            id: userDetails.userId,
            isDeleted: false,
          },
        });

        // if not found then send error
        if (!checkAdminInDb) {
          return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            status: HTTP_STATUS_CODE.BAD_REQUEST,
            message: req.__("Admin.Auth.NotFound"),
            data: "",
            error: "",
          });
        }
        // create payload with new details of user if not new details given then keep old as it is
        const updatePayload = {
          name: userDetails.name ? userDetails.name : checkAdminInDb.name,
          email: userDetails.email ? userDetails.email : checkAdminInDb.email,
          gender: userDetails.gender
            ? userDetails.gender
            : checkAdminInDb.gender,
          dateOfBirth: userDetails.dateOfBirth
            ? userDetails.dateOfBirth
            : checkAdminInDb.dateOfBirth,
          countryCode: userDetails.countryCode
            ? userDetails.countryCode
            : checkAdminInDb.countryCode,
        };
        //creation of data
        await sequelize.transaction(async (transaction) => {
          // update admin with new details
          await Admin.update(updatePayload, {
            where: {
              id: userDetails.userId,
              isDeleted: false,
            },
            transaction,
          });
        });

        //return response
        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          message: req.__("Admin.Auth.AdminUpdated"),
          data: {},
          error: "",
        });
      }

      // find old details of user
      const checkUserInDb = await User.findOne({
        where: {
          id: userDetails.userId,
          isDeleted: false,
        },
      });

      // if not found then send error
      if (!checkUserInDb) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("User.Auth.NotFound"),
          data: "",
          error: "",
        });
      }

      // create payload with new details of user if not new details given then keep old as it is
      const updatePayload = {
        name: userDetails.name ? userDetails.name : checkUserInDb.name,
        email: userDetails.email ? userDetails.email : checkUserInDb.email,
        gender: userDetails.gender ? userDetails.gender : checkUserInDb.gender,
        dateOfBirth: userDetails.dateOfBirth
          ? userDetails.dateOfBirth
          : checkUserInDb.dateOfBirth,
        countryCode: userDetails.countryCode
          ? userDetails.countryCode
          : checkUserInDb.countryCode,
      };

      //creation of data
      await sequelize.transaction(async (transaction) => {
        // user details with new detais by superAdmin
        await User.update(updatePayload, {
          where: {
            id: userDetails.userId,
            isDeleted: false,
          },
          transaction,
        });
      });

      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Admin.Auth.UserUpdated"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminController - editUserByAdminAndSuperAdmin",
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
   * @name editUserByAdminOrSuperAdmin
   * @file AdminController.js
   * @param {Request} req
   * @param {Response} res
   * @description edit User By Admin Or SuperAdmin
   * @author Rutvik Malaviya
   */

  editUserByAdminOrSuperAdmin: async (req, res) => {
    try {
      const userDetails = {
        id: req.headers.userData.id,
        userId: req.body.userId,
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        countryCode: req.body.countryCode,
        eventCode: VALIDATION_EVENTS.UPDATE_USER_BY_ADMIN_OR_SUPER_ADMIN,
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

      // find old details of user
      const checkUserInDb = await User.findOne({
        where: {
          id: userDetails.userId,
          isDeleted: false,
        },
      });

      // if not found then send error
      if (!checkUserInDb) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("User.Auth.NotFound"),
          data: "",
          error: "",
        });
      }

      // create payload with new details of user if not new details given then keep old as it is
      const updatePayload = {
        name: userDetails.name ? userDetails.name : checkUserInDb.name,
        email: userDetails.email ? userDetails.email : checkUserInDb.email,
        gender: userDetails.gender ? userDetails.gender : checkUserInDb.gender,
        dateOfBirth: userDetails.dateOfBirth
          ? userDetails.dateOfBirth
          : checkUserInDb.dateOfBirth,
        countryCode: userDetails.countryCode
          ? userDetails.countryCode
          : checkUserInDb.countryCode,
      };

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await User.update(updatePayload, {
          where: {
            id: userDetails.userId,
            isDeleted: false,
          },
          transaction,
        });
      });
      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Admin.Auth.UserUpdated"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminController - editUserByAdminAndSuperAdmin",
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
   * @name getAdminList
   * @file AdminController.js
   * @param {Request} req
   * @param {Response} res
   * @description get admin list for superAdmin
   * @author Rutvik Malaviya
   */

  getAdminList: async (req, res) => {
    try {
      const userDetails = {
        limit: Number(req.query.limit) || 10,
        skip: Number(req.query.skip) || 0,
        search: req.query.search,
        sortBy: req.query.sortBy || "createdAt-DESC", //name = ASC, DESC
        eventCode: VALIDATION_EVENTS.GET_ADMIN_LIST,
      };

      let findQuery = {
        isDeleted: false,
        role: USER_ROLES.ADMIN,
      };

      //search admin by name
      if (userDetails.search && userDetails.search !== "") {
        findQuery.name = {
          [Op.iLike]: `%${userDetails.search}%`,
        };
      }

      //sorting data
      const splitSortBy = userDetails.sortBy.split("-");

      //check if admin already exists with same name or not\
      const findExist = await Admin.findAndCountAll({
        where: findQuery,
        limit: userDetails.limit,
        offset: userDetails.skip,
        order: [[splitSortBy[0], splitSortBy[1]]],
        attributes: [
          "id",
          "name",
          "email",
          "countryCode",
          "profileImageId",
          "role",
        ],
        include: [
          {
            model: Media,
            attributes: ["id", "url", "originalName"],
            as: "mediaDetails",
            required: false, // Makes the join a LEFT JOIN
            where: {
              isDeleted: false,
            },
          },
        ],
      });

      let finalData = [];
      if (findExist.rows.length) {
        finalData = findExist.rows.map((obj) => {
          const data = obj.toJSON(); // Convert Sequelize instance to a plain object
          return {
            ...data,
            mediaDetails: data.mediaDetails || {},
          };
        });
      }

      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: {
          count: findExist.count || 0,
          rows: finalData,
        },
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminController - getAdminList",
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
   * @name getUserList
   * @file AdminController.js
   * @param {Request} req
   * @param {Response} res
   * @description get user list for admin or superAdmin
   * @author Rutvik Malaviya
   */

  getUserList: async (req, res) => {
    try {
      const userDetails = {
        limit: Number(req.query.limit) || 10,
        skip: Number(req.query.skip) || 0,
        search: req.query.search,
        sortBy: req.query.sortBy || "createdAt-DESC", //name = ASC, DESC
        eventCode: VALIDATION_EVENTS.GET_USER_LIST,
      };

      let findQuery = {
        isDeleted: false,
        role: USER_ROLES.USER,
      };

      //search admin by name
      if (userDetails.search && userDetails.search !== "") {
        findQuery.name = {
          [Op.iLike]: `%${userDetails.search}%`,
        };
      }

      //sorting data
      const splitSortBy = userDetails.sortBy.split("-");

      //check if admin already exists with same name or not\
      const findExist = await User.findAndCountAll({
        where: findQuery,
        limit: userDetails.limit,
        offset: userDetails.skip,
        order: [[splitSortBy[0], splitSortBy[1]]],
        attributes: [
          "id",
          "name",
          "email",
          "socialMediaId",
          "loginWith",
          "loginMethod",
          "countryCode",
          "profileImageId",
          "role",
          "dateOfBirth",
          "age",
          "phone",
        ],
        include: [
          {
            model: Media,
            attributes: ["id", "url", "originalName"],
            as: "mediaDetails",
            required: false, // Makes the join a LEFT JOIN
            where: {
              isDeleted: false,
            },
          },
        ],
      });

      let finalData = [];
      if (findExist.rows.length) {
        finalData = findExist.rows.map((obj) => {
          const data = obj.toJSON(); // Convert Sequelize instance to a plain object
          return {
            ...data,
            mediaDetails: data.mediaDetails || {},
          };
        });
      }

      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: {
          count: findExist.count || 0,
          rows: finalData,
        },
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminController - getAdminList",
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
   * @name createAdminOrUserBySuperAdmin
   * @file AdminController.js
   * @param {Request} req
   * @param {Response} res
   * @description create admin or user by superAdmin
   * @author Rutvik Malaviya
   */

  createAdminOrUserBySuperAdmin: async (req, res) => {
    try {
      const userDetails = {
        id: req.headers.userData.id,
        creatorRole: req.body.creatorRole,
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        password: req.body.password || "test@123",
        countryCode: req.body.countryCode,
        role: req.body.role,
        eventCode: VALIDATION_EVENTS.CREATE_ADMIN_OR_USER,
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

      // calculate user age
      userDetails.age = await calculateAge(userDetails.dateOfBirth);
      //generate userId
      const userId = UUID();

      // if all field is fullfield the generate hash password
      const salt = BCRYPT.genSaltSync(10);
      const hashPassword = BCRYPT.hashSync(userDetails.password, salt);

      if (userDetails.role === USER_ROLES.ADMIN) {
        const existingUserData = await Admin.findOne({
          where: {
            email: userDetails.email,
            isDeleted: false,
          },
          attributes: ["id"],
        });

        if (existingUserData) {
          return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            status: HTTP_STATUS_CODE.BAD_REQUEST,
            message: req.__("Admin.Auth.AdminAlreadyExists"),
            data: {},
            error: "",
          });
        }

        const payload = {
          id: userId,
          name: userDetails.name,
          email: userDetails.email.toLowerCase(),
          gender: userDetails.gender,
          password: hashPassword,
          role: userDetails.role,
        };
        //creation of data
        await sequelize.transaction(async (transaction) => {
          await Admin.create(payload, { transaction });
        });
        //send response
        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          message: req.__("Admin.Auth.AdminCreated"),
          data: {},
          error: "",
        });
      }

      const existingUserData = await User.findOne({
        where: {
          email: userDetails.email,
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

      const payload = {
        id: userId,
        name: userDetails.name,
        email: userDetails.email.toLowerCase(),
        phone: userDetails.phone,
        gender: userDetails.gender,
        dateOfBirth: userDetails.dateOfBirth,
        password: hashPassword,
        countryCode: userDetails.countryCode,
        role: userDetails.role,
        age: userDetails.age,
      };

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await User.create(payload, { transaction });
      });
      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Admin.Auth.UserCreated"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminController - createAdminOrUserBySuperAdmin",
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
   * @name createUserByAdminOrSuperAdmin
   * @file AdminController.js
   * @param {Request} req
   * @param {Response} res
   * @description create user by admin or superAdmin
   * @author Rutvik Malaviya
   */

  createUserByAdminOrSuperAdmin: async (req, res) => {
    try {
      const userDetails = {
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        password: req.body.password || "test@123",
        countryCode: req.body.countryCode,
        role: req.body.role,
        eventCode: VALIDATION_EVENTS.CREATE_USER_BY_ADMIN_OR_SUPER_ADMIN,
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
      // calculate user age
      userDetails.age = await calculateAge(userDetails.dateOfBirth);
      //generate userId
      const userId = UUID();

      // if all field is fullfield the generate hash password
      const salt = BCRYPT.genSaltSync(10);
      const hashPassword = BCRYPT.hashSync(userDetails.password, salt);

      const existingUserData = await User.findOne({
        where: {
          email: userDetails.email,
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

      const payload = {
        id: userId,
        name: userDetails.name,
        email: userDetails.email.toLowerCase(),
        phone: userDetails.phone,
        gender: userDetails.gender,
        dateOfBirth: userDetails.dateOfBirth,
        password: hashPassword,
        countryCode: userDetails.countryCode,
        role: userDetails.role,
        age: userDetails.age,
      };

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await User.create(payload, { transaction });
      });
      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Admin.Auth.UserCreated"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "AdminController - createUserByAdminOrSuperAdmin",
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
