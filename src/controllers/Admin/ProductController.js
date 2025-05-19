const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
  Op,
} = require("../../../config/constant");
const { validateCategory } = require("../../validation/CategoryValidation");
const { generateError } = require("../../helper/error/generateError");
const Product = require("../../../db/models/Product/Product");
const sequelize = require("../../../config/database");

module.exports = {
  /**
   * @name createProduct
   * @file ProductController.js
   * @param {Request} req
   * @param {Response} res
   * @description create product by admin or super admin
   * @author Rutvik Malaviya
   */

  createProduct: async (req, res) => {
    try {
      const productDetails = {
        id: req.headers.userData.id,
        categoryName: req.body.categoryName,
        productImageId: req.body.productImageId,
        productName: req.body.productName,
        price: req.body.price,
        currencySymbol: req.body.currencySymbol,
        productDescription: req.body.productDescription,
        rating: req.body.rating,
        review: req.body.review,
        specification: req.body.specification,
        otherDetails: req.body.otherDetails,
        discount: req.body.discount,
        availableOffers: req.body.availableOffers,
        eventCode: VALIDATION_EVENTS.CREATE_PRODUCT,
      };

      // Perform validation
      const validationResult = validateCategory(productDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkInDb = await Product.findOne({
        where: {
          productName: productDetails.productName,
          categoryName: productDetails.categoryName,
          isDeleted: false,
        },
        attributes: ["id"],
      });

      if (checkInDb) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Product.ProductAlreadyExist"),
          data: {},
          error: "",
        });
      }

      // payload create
      const productPayload = {
        categoryName: productDetails.categoryName,
        productImageId: productDetails.productImageId,
        productName: productDetails.productName,
        price: productDetails.price,
        currencySymbol: productDetails.currencySymbol,
        productDescription: productDetails.productDescription,
        rating: productDetails.rating,
        review: productDetails.review,
        specification: productDetails.specification,
        otherDetails: productDetails.otherDetails,
        discount: productDetails.discount,
        availableOffers: productDetails.availableOffers,
      };

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Product.create(productPayload, { transaction });
      });

      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Product.ProductCreated"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "ProductController - createProduct",
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
   * @name updateProduct
   * @file ProductController.js
   * @param {Request} req
   * @param {Response} res
   * @description update product by admin or super admin
   * @author Rutvik Malaviya
   */

  updateProduct: async (req, res) => {
    try {
      const productDetails = {
        id: req.headers.userData.id,
        productId: req.query.productId,
        categoryName: req.body.categoryName,
        productImageId: req.body.productImageId,
        productName: req.body.productName,
        price: req.body.price,
        currencySymbol: req.body.currencySymbol,
        productDescription: req.body.productDescription,
        rating: req.body.rating,
        review: req.body.review,
        specification: req.body.specification,
        otherDetails: req.body.otherDetails,
        discount: req.body.discount,
        availableOffers: req.body.availableOffers,
        eventCode: VALIDATION_EVENTS.UPDATE_PRODUCT,
      };

      // Perform validation
      const validationResult = validateCategory(productDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkInDb = await Product.findOne({
        where: {
          id: productDetails.productId,
          isDeleted: false,
        },
      });

      if (!checkInDb) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Product.ProductNotExist"),
          data: {},
          error: "",
        });
      }

      const updatedPayload = {
        categoryName: productDetails.categoryName
          ? productDetails.categoryName
          : checkInDb.categoryName,
        productImageId: productDetails.productImageId
          ? productDetails.productImageId
          : checkInDb.productImageId,
        productName: productDetails.productName
          ? productDetails.productName
          : checkInDb.productName,
        price: productDetails.price ? productDetails.price : checkInDb.price,
        currencySymbol: productDetails.currencySymbol
          ? productDetails.currencySymbol
          : checkInDb.currencySymbol,
        productDescription: productDetails.productDescription
          ? productDetails.productDescription
          : checkInDb.productDescription,
        rating: productDetails.rating
          ? productDetails.rating
          : checkInDb.rating,
        review: productDetails.review
          ? productDetails.review
          : checkInDb.review,
        specification: productDetails.specification
          ? productDetails.specification
          : checkInDb.specification,
        otherDetails: productDetails.otherDetails
          ? productDetails.otherDetails
          : checkInDb.otherDetails,
        discount: productDetails.discount
          ? productDetails.discount
          : checkInDb.discount,
      };

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Product.update(updatedPayload, {
          where: {
            id: productDetails.productId,
            isDeleted: false,
          },
          transaction,
        });
      });

      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Product.ProductUpdated"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "ProductController - updateProduct",
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
   * @name deleteProduct
   * @file ProductController.js
   * @param {Request} req
   * @param {Response} res
   * @description delete product by admin or super admin using id
   * @author Rutvik Malaviya
   */

  deleteProduct: async (req, res) => {
    try {
      const productDetails = {
        id: req.headers.userData.id,
        productId: req.query.productId,
        eventCode: VALIDATION_EVENTS.DELETE_PRODUCT,
      };

      // Perform validation
      const validationResult = validateCategory(productDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkInDb = await Product.findOne({
        where: {
          id: productDetails.productId,
          isDeleted: false,
        },
        attributes: ["id"],
      });

      if (!checkInDb) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Product.ProductNotExist"),
          data: {},
          error: "",
        });
      }

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Product.destroy({
          where: {
            id: productDetails.productId,
            isDeleted: false,
          },
          transaction,
        });
      });

      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Product.ProductDeleted"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "ProductController - deleteProduct",
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
   * @name listProduct
   * @file ProductController.js
   * @param {Request} req
   * @param {Response} res
   * @description list product by admin or super admin
   * @author Rutvik Malaviya
   */

  listProduct: async (req, res) => {
    try {
      const productDetails = {
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
      if (productDetails.search && productDetails.search !== "") {
        findQuery.productName = {
          [Op.iLike]: `%${productDetails.search}%`,
        };
      }

      //sorting data
      const splitSortBy = productDetails.sortBy.split("-");

      //check if admin already exists with same name or not\
      const findExist = await Product.findAndCountAll({
        where: findQuery,
        limit: productDetails.limit,
        offset: productDetails.skip,
        order: [[splitSortBy[0], splitSortBy[1]]],
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
        apiName: "ProductController - listproduct",
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
