const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
  USER_ROLES,
  Op,
  UUID,
  BCRYPT,
} = require("../../../config/constant");
const { validateCategory } = require("../../validation/CategoryValidation");
const { generateError } = require("../../helper/error/generateError");
const Categories = require("../../../db/models/Categories/Categories");
const Admin = require("../../../db/models/Admins/Admin");
const sequelize = require("../../../config/database");

module.exports = {
  /**
   * @name createCategories
   * @file CategoriesController.js
   * @param {Request} req
   * @param {Response} res
   * @description create categories by admin or super admin
   * @author Rutvik Malaviya
   */

  createCategories: async (req, res) => {
    try {
      const categoryDetails = {
        id: req.headers.userData.id,
        categoryName: req.body.categoryName,
        eventCode: VALIDATION_EVENTS.CREATE_CATEGORY,
      };

      // Perform validation
      const validationResult = validateCategory(categoryDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkInDb = await Categories.findOne({
        where: {
          categoryName: categoryDetails.categoryName,
          isDeleted: false,
        },
      });

      if (checkInDb) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Category.CategoryAlreadyExist"),
          data: {},
          error: "",
        });
      }

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Categories.create(
          { categoryName: categoryDetails.categoryName },
          { transaction }
        );
      });

      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Category.CategoryCreated"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "CategoriesController - createCategories",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      console.log(error);
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },
  /**
   * @name updateCategories
   * @file CategoriesController.js
   * @param {Request} req
   * @param {Response} res
   * @description update categories by admin or super admin using id
   * @author Rutvik Malaviya
   */

  updateCategories: async (req, res) => {
    try {
      const categoryDetails = {
        id: req.headers.userData.id,
        categoryId: req.body.categoryId,
        categoryName: req.body.categoryName,
        eventCode: VALIDATION_EVENTS.UPDATE_CATEGORY,
      };

      // Perform validation
      const validationResult = validateCategory(categoryDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkInDb = await Categories.findOne({
        where: {
          id: categoryDetails.categoryId,
          isDeleted: false,
        },
        attributes: ["id", "categoryName"],
      });

      if (!checkInDb) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Category.CategoryNotExist"),
          data: {},
          error: "",
        });
      }

      const updatedPayload = {
        categoryName: categoryDetails.categoryName
          ? categoryDetails.categoryName
          : checkInDb.categoryName,
      };

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Categories.update(updatedPayload, {
          where: {
            id: categoryDetails.categoryId,
            isDeleted: false,
          },
          transaction,
        });
      });

      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Category.CategoryUpdated"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "CategoriesController - updateCategories",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      console.log(error);
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name deleteCategories
   * @file CategoriesController.js
   * @param {Request} req
   * @param {Response} res
   * @description delete categories by admin or super admin using id
   * @author Rutvik Malaviya
   */

  deleteCategories: async (req, res) => {
    try {
      const categoryDetails = {
        id: req.headers.userData.id,
        categoryId: req.body.categoryId,
        eventCode: VALIDATION_EVENTS.DELETE_CATEGORY,
      };

      // Perform validation
      const validationResult = validateCategory(categoryDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkInDb = await Categories.findOne({
        where: {
          id: categoryDetails.categoryId,
          isDeleted: false,
        },
        attributes: ["id"],
      });

      if (!checkInDb) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Category.CategoryNotExist"),
          data: {},
          error: "",
        });
      }

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Categories.update(
          {
            isDeleted: true,
            deletedAt: Date.now(),
          },
          {
            where: {
              id: categoryDetails.categoryId,
              isDeleted: false,
            },
            transaction,
          }
        );
      });

      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Category.CategoryDeleted"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "CategoriesController - deleteCategories",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      console.log(error);
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name listCategories
   * @file CategoriesController.js
   * @param {Request} req
   * @param {Response} res
   * @description list categories by admin or super admin
   * @author Rutvik Malaviya
   */

  listCategories: async (req, res) => {
    try {
      const categoryDetails = {
        id: req.headers.userData.id,
        limit: Number(req.query.limit) || 10,
        skip: Number(req.query.skip) || 0,
        search: req.query.search,
        sortBy: req.query.sortBy || "createdAt-DESC", //name = ASC, DESC
      };

      let findQuery = {
        isDeleted: false,
      };

      //search admin by name
      if (categoryDetails.search && categoryDetails.search !== "") {
        findQuery.categoryName = {
          [Op.iLike]: `%${categoryDetails.search}%`,
        };
      }

      //sorting data
      const splitSortBy = categoryDetails.sortBy.split("-");

      //check if admin already exists with same name or not\
      const findExist = await Categories.findAndCountAll({
        where: findQuery,
        limit: categoryDetails.limit,
        offset: categoryDetails.skip,
        order: [[splitSortBy[0], splitSortBy[1]]],
        attributes: ["id", "categoryName"],
      });

      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: {
          count: findExist.count || 0,
          rows: findExist.rows,
        },
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "CategoriesController - listCategories",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      console.log(error);
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },
};
