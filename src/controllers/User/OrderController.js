const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
  UUID,
} = require("../../../config/constant");
const { generateError } = require("../../helper/error/generateError");
const Product = require("../../../db/models/Product/Product");
const sequelize = require("../../../config/database");
const Media = require("../../../db/models/Media/Media");
const { validateOrder } = require("../../validation/OrderValidation");
const Order = require("../../../db/models/Orders/Orders");
const Address = require("../../../db/models/Address/Address");

module.exports = {
  /**
   * @name createOrder
   * @file OrderController.js
   * @param {Request} req
   * @param {Response} res
   * @description create order by user
   * @author Rutvik Malaviya
   */
  createOrder: async (req, res) => {
    try {
      const orderDetails = {
        id: req.headers.userData.id,
        productId: req.body.productId,
        quantity: req.body.quantity,
        totalPrice: req.body.totalPrice,
        addressId: req.body.addressId,
        paymentMethod: req.body.paymentMethod,
        eventCode: VALIDATION_EVENTS.CREATE_ORDER,
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

      const checkAlreadyExist = await Product.findOne({
        where: {
          id: orderDetails.productId,
          isDeleted: false,
        },
        attributes: ["id"],
      });
      if (!checkAlreadyExist) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Product.ProductNotExist"),
          data: {},
          error: "",
        });
      }

      const checkAddressExist = await Address.findOne({
        where: {
          id: orderDetails.addressId,
          isDeleted: false,
        },
        attributes: ["id"],
      });
      if (!checkAddressExist) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Address.AddressNotExist"),
          data: {},
          error: "",
        });
      }
      await sequelize.transaction(async (transaction) => {
        await Order.create(
          {
            userId: orderDetails.id,
            productId: orderDetails.productId,
            quantity: orderDetails.quantity,
            totalPrice: orderDetails.totalPrice,
            addressId: orderDetails.addressId,
            paymentMethod: orderDetails.paymentMethod,
            trackingNumber: UUID(),
          },
          { transaction }
        );
      });
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Order.OrderCreated"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "User- OrderController - createOrder",
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
   * @name deleteOrder
   * @file OrderController.js
   * @param {Request} req
   * @param {Response} res
   * @description delete order by user
   * @author Rutvik Malaviya
   */
  deleteOrder: async (req, res) => {
    try {
      const orderDetails = {
        id: req.headers.userData.id,
        orderId: req.body.orderId,
        eventCode: VALIDATION_EVENTS.DELETE_ORDER,
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

      const checkAlreadyExist = await Order.findOne({
        where: {
          id: orderDetails.orderId,
          isDeleted: false,
        },
        attributes: ["id"],
      });
      if (!checkAlreadyExist) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Product.ProductNotExist"),
          data: {},
          error: "",
        });
      }
      await sequelize.transaction(async (transaction) => {
        await Order.update(
          {
            isDeleted: true,
          },
          {
            where: {
              id: orderDetails.orderId,
            },
          },
          { transaction }
        );
      });
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Order.OrderDeleted"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "User- OrderController - deleteOrder",
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
   * @name listOrder
   * @file OrderController.js
   * @param {Request} req
   * @param {Response} res
   * @description list order by user
   * @author Rutvik Malaviya
   */
  listOrder: async (req, res) => {
    try {
      const orderDetails = {
        limit: Number(req.query.limit) || 10,
        skip: Number(req.query.skip) || 0,
        sortBy: req.query.sortBy || "createdAt-DESC", //name = ASC, DESC
      };

      let findQuery = {
        isDeleted: false,
      };

      //sorting data
      const splitSortBy = orderDetails.sortBy.split("-");

      //check if admin already exists with same name or not\
      const findExist = await Order.findAndCountAll({
        where: findQuery,
        limit: orderDetails.limit,
        offset: orderDetails.skip,
        order: [[splitSortBy[0], splitSortBy[1]]],
        include: [
          {
            model: Product,
            attributes: ["id", "productName"],
            as: "orderDetails",
            required: false,
            where: {
              isDeleted: false,
            },
            include: [
              {
                model: Media,
                attributes: ["id", "url"],
                as: "mediaDetails",
                required: false,
                where: {
                  isDeleted: false,
                },
              },
            ],
          },
          {
            model: Address,
            attributes: {
              exclude: ["createdAt", "updatedAt", "isDeleted", "deletedAt"],
            },
            as: "addressDetails",
            required: false,
            where: {
              isDeleted: false,
            },
          },
        ],
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
        apiName: "User- OrderController - listOrder",
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
   * @name getOrderById
   * @file OrderController.js
   * @param {Request} req
   * @param {Response} res
   * @description get order by id by user
   * @author Rutvik Malaviya
   */
  getOrderById: async (req, res) => {
    try {
      const orderDetails = {
        id: req.headers.userData.id,
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
      });
      if (!order) {
        return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
          status: HTTP_STATUS_CODE.NOT_FOUND,
          message: req.__("Order.OrderNotFound"),
          data: {},
          error: "",
        });
      }
      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: order,
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "User- OrderController - getOrderById",
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
