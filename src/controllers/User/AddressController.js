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
   * @description create address for user
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
};
