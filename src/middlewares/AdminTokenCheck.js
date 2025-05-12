const {
  HTTP_STATUS_CODE,
  JWT,
  USER_ROLES,
  Op,
} = require("../../config/constant");
const Admin = require("../../db/models/Admins/Admin");

module.exports.isAdmin = async (req, res, next) => {
  try {
    //getting authToken from headers
    let authToken = req.headers["authorization"];

    //check if authToken starts with Bearer, fetch the token or return error
    if (authToken && authToken.startsWith("Bearer ")) {
      //if token start with Bearer
      authToken = authToken.split(" ")[1];
    } else {
      //if token is not provided then send validation response
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        status: HTTP_STATUS_CODE.UNAUTHORIZED,
        errorCode: "AUTH004",
        message: "",
        data: {},
        error: "",
      });
    }

    //verify jwt token based on jwt key
    let decodedToken = await JWT.verify(authToken, process.env.JWT_KEY);

    //check for decodedToken expiry
    if (
      decodedToken &&
      decodedToken.exp &&
      decodedToken.exp > Math.floor(Date.now() / 1000)
    ) {
      if (decodedToken.id) {
        const admin = await Admin.findOne({
          where: {
            id: decodedToken.id,
            role: {
              [Op.in]: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
            },
            isDeleted: false,
          },
          attributes: ["id", "email", "name", "authToken", "role"],
        });

        if (!admin) {
          //if admin is not found in database then send validation response
          return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
            status: HTTP_STATUS_CODE.UNAUTHORIZED,
            errorCode: "AUTH003",
            message: "",
            data: {},
            error: "",
          });
        }

        /* checks token from header with current token stored in database for that admin
          if that doesn't matches then send validation response */
        if (admin.dataValues.authToken !== authToken) {
          return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
            status: HTTP_STATUS_CODE.UNAUTHORIZED,
            errorCode: "AUTH003",
            message: "",
            data: {},
            error: "",
          });
        }

        req.headers.userData = admin;
        next();
      } else {
        return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODE.UNAUTHORIZED,
          errorCode: "AUTH003",
          message: "",
          data: {},
          error: "",
        });
      }
    } else {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        status: HTTP_STATUS_CODE.UNAUTHORIZED,
        errorCode: "AUTH004",
        message: "",
        data: {},
        error: "",
      });
    }
  } catch (error) {
    //if error is of jwt token expire then send validation response with errorcode 'AUTH004'
    if (error instanceof JWT.TokenExpiredError) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        status: HTTP_STATUS_CODE.UNAUTHORIZED,
        errorCode: "AUTH004",
        message: "",
        data: {},
        error: "",
      });
    } else {
      //send server error response
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        errorCode: "ERR500",
        message: "",
        data: {},
        error: error.message,
      });
    }
  }
};
