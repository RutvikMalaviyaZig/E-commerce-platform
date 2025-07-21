const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
} = require("../../../config/constant");
const { generateError } = require("../../helper/error/generateError");
const Product = require("../../../db/models/Product/Product");
const sequelize = require("../../../config/database");
const Media = require("../../../db/models/Media/Media");
const Order = require("../../../db/models/Orders/Orders");
const Address = require("../../../db/models/Address/Address");
const User = require("../../../db/models/Users/User");
const { Op } = require("sequelize");
const { validateOrder } = require("../../validation/OrderValidation");

module.exports = {
  /**
   * @name getAllOrders
   * @file OrderController.js
   * @param {Request} req
   * @param {Response} res
   * @description list order by admin or super admin
   * @author Rutvik Malaviya
   */
  getAllOrders: async (req, res) => {
    try {
      const orderDetails = {
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
      if (orderDetails.search && orderDetails.search !== "") {
        findQuery.email = {
          [Op.iLike]: `%${orderDetails.search}%`,
        };
      }

      //sorting
      const sortBy = orderDetails.sortBy.split("-");
      const sortOrder = sortBy[1] === "ASC" ? "ASC" : "DESC";
      const sortColumn = sortBy[0];

      //pagination
      const offset = orderDetails.skip;
      const limit = orderDetails.limit;

      //get orders
      const { count, rows: orders } = await Order.findAndCountAll({
        where: findQuery,
        attributes: {
          exclude: ["isDeleted", "createdAt", "updatedAt", "deletedAt"],
        },
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
            where: {
              isDeleted: false,
            },
            as: "userDetails",
            required: true,
          },
          {
            model: Address,
            attributes: {
              exclude: ["isDeleted", "createdAt", "updatedAt", "deletedAt"],
            },
            where: {
              isDeleted: false,
            },
            as: "addressDetails",
            required: true,
          },
          {
            model: Product,
            attributes: {
              exclude: ["isDeleted", "createdAt", "updatedAt", "deletedAt"],
            },
            where: {
              isDeleted: false,
            },
            as: "orderDetails",
            include: [
              {
                model: Media,
                attributes: {
                  exclude: ["isDeleted", "createdAt", "updatedAt", "deletedAt"],
                },
                where: {
                  isDeleted: false,
                },
                as: "mediaDetails",
                required: true,
              },
            ],
          },
        ],
        order: [[sortColumn, sortOrder]],
        limit,
        offset,
      });

      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: {
          orders: orders || [],
          pagination: {
            total: count,
            page: Math.floor(orderDetails.skip / limit) + 1 || 1,
            limit,
            totalPages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "OrderController - getAllOrders",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      //send response
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name getOrderById
   * @file OrderController.js
   * @param {Request} req
   * @param {Response} res
   * @description get order by id by admin or super admin
   * @author Rutvik Malaviya
   */
  getOrderById: async (req, res) => {
    try {
      const orderDetails = {
        orderId: req.query.orderId,
        eventCode: VALIDATION_EVENTS.GET_ORDER_BY_ID,
      };

      // Perform validation
      const validationResult = validateOrder(orderDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const order = await Order.findOne({
        where: {
          id: orderDetails.orderId,
          isDeleted: false,
        },
        attributes: {
          exclude: ["isDeleted", "createdAt", "updatedAt", "deletedAt"],
        },
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
            where: {
              isDeleted: false,
            },
            as: "userDetails",
            required: true,
          },
          {
            model: Address,
            attributes: {
              exclude: ["isDeleted", "createdAt", "updatedAt", "deletedAt"],
            },
            where: {
              isDeleted: false,
            },
            as: "addressDetails",
            required: true,
          },
          {
            model: Product,
            attributes: {
              exclude: ["isDeleted", "createdAt", "updatedAt", "deletedAt"],
            },
            where: {
              isDeleted: false,
            },
            as: "orderDetails",
            include: [
              {
                model: Media,
                attributes: ["id", "url", "fileName"],
                where: {
                  isDeleted: false,
                },
                as: "mediaDetails",
                required: true,
              },
            ],
          },
        ],
      });

      if (!order) {
        return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
          status: HTTP_STATUS_CODE.NOT_FOUND,
          message: "Order not found",
          data: {},
          error: "",
        });
      }

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: order,
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "OrderController - getOrderById",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      //send response
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name getOrderByUserId
   * @file OrderController.js
   * @param {Request} req
   * @param {Response} res
   * @description get order by user id by admin or super admin
   * @author Rutvik Malaviya
   */
  getOrderByUserId: async (req, res) => {
    try {
      const orderDetails = {
        userId: req.query.userId,
        eventCode: VALIDATION_EVENTS.GET_ORDER_BY_USER_ID,
      };

      // Perform validation
      const validationResult = validateOrder(orderDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const order = await Order.findOne({
        where: {
          userId: orderDetails.userId,
          isDeleted: false,
        },
        attributes: {
          exclude: ["isDeleted", "createdAt", "updatedAt", "deletedAt"],
        },
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
            where: {
              isDeleted: false,
            },
            as: "userDetails",
            required: true,
          },
          {
            model: Product,
            attributes: ["id", "productName", "price", "currencySymbol"],
            where: {
              isDeleted: false,
            },
            as: "orderDetails",
            include: [
              {
                model: Media,
                attributes: ["id", "url", "fileName"],
                where: {
                  isDeleted: false,
                },
                as: "mediaDetails",
              },
            ],
          },
        ],
      });

      if (!order) {
        return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
          status: HTTP_STATUS_CODE.NOT_FOUND,
          message: "Order not found",
          data: {},
          error: "",
        });
      }
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: order,
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "OrderController - getOrderByUserId",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      //send response
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },
};
