const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
  Op,
} = require("../../../config/constant");
const { generateError } = require("../../helper/error/generateError");
const Product = require("../../../db/models/Product/Product");
const Likes = require("../../../db/models/Likes/Likes");
const sequelize = require("../../../config/database");
const Media = require("../../../db/models/Media/Media");
const Address = require("../../../db/models/Address/Address");
const { validateAddress } = require("../../validation/AddressValidation");

module.exports = {
  /**
   * @name createAddress
   * @file AddressController.js
   * @param {Request} req
   * @param {Response} res
   * @description create address for user by admin
   * @author Rutvik Malaviya
   */

  createAddress: async (req, res) => {
    try {
      const addressDetails = {
        userId: req.headers.userData.dataValues.id,
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        postalCode: req.body.postalCode,
        typeOfAddress: req.body.typeOfAddress,
        eventCode: VALIDATION_EVENTS.CREATE_ADDRESS,
      };

      // Perform validation
      const validationResult = validateAddress(addressDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkAlreadyExist = await Address.findOne({
        where: {
          userId: addressDetails.userId,
          fullName: addressDetails.fullName,
          phoneNumber: addressDetails.phoneNumber,
          street: addressDetails.street,
          city: addressDetails.city,
          state: addressDetails.state,
          country: addressDetails.country,
          postalCode: addressDetails.postalCode,
          typeOfAddress: addressDetails.typeOfAddress,
          isDeleted: false,
        },
      });

      if (checkAlreadyExist) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Address.AddressAlreadyExist"),
          data: {},
          error: "",
        });
      }

      const payload = {
        userId: addressDetails.userId,
        fullName: addressDetails.fullName,
        phoneNumber: addressDetails.phoneNumber,
        street: addressDetails.street,
        city: addressDetails.city,
        state: addressDetails.state,
        country: addressDetails.country,
        postalCode: addressDetails.postalCode,
        typeOfAddress: addressDetails.typeOfAddress,
      };

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Address.create(payload, { transaction });
      });
      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Address.AddressCreated"),
        data: "",
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "User- AddressController - createAddress",
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
   * @name updateAddress
   * @file AddressController.js
   * @param {Request} req
   * @param {Response} res
   * @description update address for user
   * @author Rutvik Malaviya
   */

  updateAddress: async (req, res) => {
    try {
      const addressDetails = {
        userId: req.headers.userData.dataValues.id,
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        postalCode: req.body.postalCode,
        typeOfAddress: req.body.typeOfAddress,
        addressId: req.query.id,
        eventCode: VALIDATION_EVENTS.UPDATE_ADDRESS,
      };

      // Perform validation
      const validationResult = validateAddress(addressDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkAlreadyExist = await Address.findOne({
        where: {
          id: addressDetails.addressId,
          userId: addressDetails.userId,
          isDeleted: false,
        },
        attributes: ["id"],
      });

      if (!checkAlreadyExist) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Address.AddressNotExist"),
          data: {},
          error: "",
        });
      }

      const payload = {
        userId: addressDetails.userId,
        fullName: addressDetails.fullName,
        phoneNumber: addressDetails.phoneNumber,
        street: addressDetails.street,
        city: addressDetails.city,
        state: addressDetails.state,
        country: addressDetails.country,
        postalCode: addressDetails.postalCode,
        typeOfAddress: addressDetails.typeOfAddress,
      };

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Address.update(
          payload,
          {
            where: {
              id: checkAlreadyExist.dataValues.id,
            },
          },
          { transaction }
        );
      });
      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Address.AddressUpdated"),
        data: "",
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "User- AddressController - updateAddress",
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
   * @name deleteAddress
   * @file AddressController.js
   * @param {Request} req
   * @param {Response} res
   * @description delete address for user
   * @author Rutvik Malaviya
   */

  deleteAddress: async (req, res) => {
    try {
      const addressDetails = {
        userId: req.headers.userData.dataValues.id,
        addressId: req.query.addressId,
        eventCode: VALIDATION_EVENTS.DELETE_ADDRESS,
      };

      // Perform validation
      const validationResult = validateAddress(addressDetails);

      // If any rule is violated, send validation response
      if (validationResult.hasError) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          data: {},
          message: "",
          error: validationResult.errors,
        });
      }

      const checkAlreadyExist = await Address.findOne({
        where: {
          id: addressDetails.addressId,
          userId: addressDetails.userId,
          isDeleted: false,
        },
        attributes: ["id"],
      });

      if (!checkAlreadyExist) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: req.__("Address.AddressNotExist"),
          data: {},
          error: "",
        });
      }

      //creation of data
      await sequelize.transaction(async (transaction) => {
        await Address.destroy(
          {
            where: {
              id: addressDetails.addressId,
              userId: addressDetails.userId,
            },
          },
          { transaction }
        );
      });
      //send response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: req.__("Address.AddressDeleted"),
        data: "",
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "User- AddressController - deleteAddress",
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
   * @name listAddress
   * @file AddressController.js
   * @param {Request} req
   * @param {Response} res
   * @description list address for user
   * @author Rutvik Malaviya
   */

  listAddress: async (req, res) => {
    try {
      const addressDetails = {
        userId: req.headers.userData.dataValues.id,
        limit: Number(req.query.limit) || 10,
        skip: Number(req.query.skip) || 0,
        search: req.query.search,
        sortBy: req.query.sortBy || "createdAt-DESC", //name = ASC, DESC
        eventCode: VALIDATION_EVENTS.DELETE_ADDRESS,
      };
      let findQuery = {
        isDeleted: false,
      };

      if (addressDetails.search && addressDetails.search !== "") {
        findQuery[Op.or] = [
          { city: { [Op.iLike]: `%${addressDetails.search}%` } },
          { state: { [Op.iLike]: `%${addressDetails.search}%` } },
          { postalCode: { [Op.iLike]: `%${addressDetails.search}%` } },
        ];
      }
      //sorting data
      const splitSortBy = addressDetails.sortBy.split("-");

      //check if admin already exists with same name or not\

      const findExist = await Address.findAndCountAll({
        where: findQuery,
        limit: addressDetails.limit,
        offset: addressDetails.skip,
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
        apiName: "User- AddressController - listAddress",
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
