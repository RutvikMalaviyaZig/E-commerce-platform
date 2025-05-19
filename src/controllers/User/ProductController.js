const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
  Op,
} = require("../../../config/constant");
const { generateError } = require("../../helper/error/generateError");
const Product = require("../../../db/models/Product/Product");
const Likes = require("../../../db/models/Likes/Likes");
const sequelize = require("../../../config/database");
const { validateLike } = require("../../validation/LikeValidation");
const Media = require("../../../db/models/Media/Media");

module.exports = {
  /**
   * @name listProduct
   * @file ProductController.js
   * @param {Request} req
   * @param {Response} res
   * @description list product by user
   * @author Rutvik Malaviya
   */

  listProduct: async (req, res) => {
    try {
      const productDetails = {
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
        apiName: "User- ProductController - listproduct",
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
   * @name likeProduct
   * @file ProductController.js
   * @param {Request} req
   * @param {Response} res
   * @description like product by user
   * @author Rutvik Malaviya
   */

  likeProduct: async (req, res) => {
    try {
      const likeProductDetails = {
        id: req.headers.userData.id,
        like: req.body.isLike,
        productId: req.body.productId,
        eventCode: VALIDATION_EVENTS.LIKE_PRODUCT,
      };
      // Perform validation
      const validationResult = validateLike(likeProductDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkInDb = await Likes.findOne({
        where: {
          productId: likeProductDetails.productId,
          userId: likeProductDetails.id,
          isDeleted: false,
        },
      });

      if (likeProductDetails.like == false && checkInDb.isLike == true) {
        //creation of data
        await sequelize.transaction(async (transaction) => {
          await Likes.destroy({
            where: {
              productId: likeProductDetails.productId,
              userId: likeProductDetails.id,
              isDeleted: false,
            },
          });
        });

        //send response
        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          message: req.__("Like.LikeUpdated"),
          data: "",
          error: "",
        });
      }

      if (checkInDb) {
        //send response
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Like.LikeProductAlreadyExist"),
          data: "",
          error: "",
        });
      }
      const payload = {
        userId: likeProductDetails.id,
        productId: likeProductDetails.productId,
        isLike: likeProductDetails.like,
      };
      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Likes.create(payload, { transaction });
      });
      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Like.LikeUpdated"),
        data: "",
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "User- ProductController - likeproduct",
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
   * @description list product by user
   * @author Rutvik Malaviya
   */

  listLikedProduct: async (req, res) => {
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
        isLike: true,
        userId: productDetails.id,
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
      const findExist = await Likes.findAndCountAll({
        where: findQuery,
        attributes: ["productId"],
        limit: productDetails.limit,
        offset: productDetails.skip,
        order: [[splitSortBy[0], splitSortBy[1]]],
      });

      const productIds = findExist.rows.map((like) => like.productId);

      const products = await Product.findAll({
        where: {
          id: productIds,
          isDeleted: false,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "deletedAt", "isDeleted"],
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
        order: [[splitSortBy[0], splitSortBy[1]]], // optional sorting
      });
      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: {
          count: findExist.count || 0,
          rows: products,
        },
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "User- ProductController - listproduct",
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
