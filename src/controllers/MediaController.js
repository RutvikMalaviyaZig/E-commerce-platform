const { HTTP_STATUS_CODE, FILE_CONSTANTS } = require("../../config/constant");
const { generateError } = require("../helper/error/generateError");
const Media = require("../../db/models/Media/Media");
const { fileValidation } = require("../utils/fileValidation");

module.exports = {
  /**
   * @name upload
   * @file MediaController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description upload file
   * @author Rutvik Malaviya
   */
  upload: async (req, res) => {
    try {
      let files = req.files;

      /* call file validation and upload it in storage helper function with necessary informations
        like new file path or folder structure, uploaded file data, valid content types's array and errorcode,
        max file size value and errorcode, current user's id */
      if (!files.length) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          errorCode: "",
          message: req.__("General.FileNotFound"),
          data: {},
          error: "",
        });
      }
      const fileUpload = await fileValidation(
        FILE_CONSTANTS.UPLOAD.PATH + FILE_CONSTANTS.TEST.PATH,
        files,
        FILE_CONSTANTS.TEST.CONTENT_TYPES,
        "Only .png, .jpg, .jpeg, mp4 and .svg files are allowed.",
        FILE_CONSTANTS.TEST.SIZE,
        "The file size should not be greater than 10mb.",
        "test id",
        req.body.compress || false,
        false
      );

      //if there is an error then send validation response
      if (fileUpload.isError) {
        //return response
        return res
          .status(
            fileUpload.isServerError
              ? HTTP_STATUS_CODE.SERVER_ERROR
              : HTTP_STATUS_CODE.BAD_REQUEST
          )
          .json({
            status: fileUpload.isServerError
              ? HTTP_STATUS_CODE.SERVER_ERROR
              : HTTP_STATUS_CODE.BAD_REQUEST,
            errorCode: "",
            message: fileUpload.isServerError ? "" : fileUpload.data,
            data: {},
            error: fileUpload.isServerError ? fileUpload.data : "",
          });
      }

      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        data: fileUpload.data,
        message: req.__("File.Uploaded"),
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "MediaController - upload",
        details: error?.message ? error.message : JSON.stringify(error),
      });

      //return error response
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        errorCode: "",
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name delete
   * @file MediaController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description delete file
   * @author Rutvik Malaviya
   */
  delete: async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          errorCode: "",
          message: req.__("General.FileNotFound"),
          data: {},
          error: "",
        });
      }

      //delete file from database
      await Media.update(
        {
          isDeleted: true,
          deletedAt: Date.now(),
        },
        {
          where: {
            id: id,
          },
        }
      );

      //return response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: req.__("File.Deleted"),
        data: {},
        error: "",
      });
    } catch (error) {
      //create error log
      await generateError({
        apiName: "MediaController - delete",
        details: error?.message ? error.message : JSON.stringify(error),
      });

      //return error response
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        errorCode: "",
        message: "",
        data: {},
        error: error.message,
      });
    }
  },
};
