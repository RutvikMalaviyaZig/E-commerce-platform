const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
  Op,
} = require("../../../config/constant");
const { generateError } = require("../../helper/error/generateError");
const Product = require("../../../db/models/Product/Product");
const Likes = require("../../../db/models/Likes/Likes");
const Media = require("../../../db/models/Media/Media");
const Cart = require("../../../db/models/Cart/Cart");
const sequelize = require("../../../config/database");
const { validateLike } = require("../../validation/LikeValidation");
const { validateCart } = require("../../validation/CartValidation");
const { validateCategory } = require("../../validation/ProductValidation");
const Review = require("../../../db/models/Product/Review");

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
            transaction,
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
   * @name listLikedProduct
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
        apiName: "User- ProductController - listLikedProduct",
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
   * @name addToCartProduct
   * @file ProductController.js
   * @param {Request} req
   * @param {Response} res
   * @description add to cart product by user
   * @author Rutvik Malaviya
   */
  addToCartProduct: async (req, res) => {
    try {
      const cartProductDetails = {
        id: req.headers.userData.id,
        isAddedCart: req.body.isAddedCart,
        productId: req.body.productId,
        eventCode: VALIDATION_EVENTS.ADD_TO_CART,
      };
      // Perform validation
      const validationResult = validateCart(cartProductDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkInDb = await Cart.findOne({
        where: {
          productId: cartProductDetails.productId,
          userId: cartProductDetails.id,
          isDeleted: false,
        },
      });

      if (
        cartProductDetails.isAddedCart == false &&
        checkInDb.isAddedCart == true
      ) {
        //creation of data
        await sequelize.transaction(async (transaction) => {
          await Cart.destroy({
            where: {
              productId: cartProductDetails.productId,
              userId: cartProductDetails.id,
              isDeleted: false,
            },
            transaction,
          });
        });

        //send response
        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          message: req.__("Cart.CartUpdated"),
          data: "",
          error: "",
        });
      }

      if (checkInDb) {
        //send response
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Cart.CartAlreadyExist"),
          data: "",
          error: "",
        });
      }
      const payload = {
        userId: cartProductDetails.id,
        productId: cartProductDetails.productId,
        isAddedCart: cartProductDetails.isAddedCart,
      };
      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Cart.create(payload, { transaction });
      });
      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Cart.CartCreated"),
        data: "",
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "User- ProductController - addeToCartProduct",
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
   * @name listCartProduct
   * @file ProductController.js
   * @param {Request} req
   * @param {Response} res
   * @description list cart product by user
   * @author Rutvik Malaviya
   */

  listCartProduct: async (req, res) => {
    try {
      const productDetails = {
        id: req.headers.userData.id,
        search: req.query.search,
        sortBy: req.query.sortBy || "createdAt-DESC", //name = ASC, DESC
      };

      let findQuery = {
        isDeleted: false,
        isAddedCart: true,
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
      const findExist = await Cart.findAndCountAll({
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
        apiName: "User- ProductController - listCartProduct",
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
   * @name reviewProduct
   * @file ProductController.js
   * @param {Request} req
   * @param {Response} res
   * @description add review for product by user
   * @author Rutvik Malaviya
   */
  reviewProduct: async (req, res) => {
    try {
      const reviewDetails = {
        userId: req.headers.userData.id,
        productId: req.body.productId,
        rating: req.body.rating,
        review: req.body.review,
        eventCode: VALIDATION_EVENTS.CREATE_REVIEW,
      };

      // Perform validation
      const validationResult = validateCategory(reviewDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      // Check if product exists
      const product = await Product.findOne({
        where: {
          id: reviewDetails.productId,
          isDeleted: false,
        },
        attributes: ["id", "rating"],
      });

      if (!product) {
        return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
          status: HTTP_STATUS_CODE.NOT_FOUND,
          message: req.__("Product.ProductNotExist"),
          data: {},
          error: "",
        });
      }
      const reviews = await Review.findAll({
        where: {
          productId: reviewDetails.productId,
          isDeleted: false,
        },
        attributes: [
          [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
        ],
      });

      const averageRating = Number(reviews[0].dataValues.averageRating) || 0;

      // Create review in database
      await sequelize.transaction(async (transaction) => {
        await Review.create(
          {
            userId: reviewDetails.userId,
            productId: reviewDetails.productId,
            rating: reviewDetails.rating,
            review: reviewDetails.review,
          },
          { transaction }
        );
        await Product.update(
          {
            rating: averageRating,
          },
          {
            where: {
              id: reviewDetails.productId,
              isDeleted: false,
            },
            transaction,
          }
        );
      });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Review.ReviewCreated"),
        data: {},
        error: "",
      });
    } catch (error) {
      await generateError({
        apiName: "User- ProductController - reviewProduct",
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
   * @name getProductById
   * @file ProductController.js
   * @param {Request} req
   * @param {Response} res
   * @description get a single product by its ID
   * @author Rutvik Malaviya
   */
  getProductById: async (req, res) => {
    try {
      const productDetails = {
        id: req.params.productId,
        eventCode: VALIDATION_EVENTS.GET_PRODUCT_BY_ID,
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

      const product = await Product.findOne({
        where: {
          id: productDetails.id,
          isDeleted: false,
        },
        include: [
          {
            model: Media,
            as: "mediaDetails",
            attributes: ["id", "url", "originalName", "mediaType"],
          },
          {
            model: Review,
            as: "reviews",
            where: {
              isDeleted: false,
            },
            required: false,
            attributes: ["id", "rating", "review", "isVerified"],
          },
        ],
      });

      if (!product) {
        return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
          status: HTTP_STATUS_CODE.NOT_FOUND,
          message: "Product not found",
          data: {},
          error: "",
        });
      }

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: product,
        error: "",
      });
    } catch (error) {
      await generateError({
        apiName: "User- ProductController - getProductById",
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
