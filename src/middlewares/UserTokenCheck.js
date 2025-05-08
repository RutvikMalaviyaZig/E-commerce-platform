const { HTTP_STATUS_CODE, JWT, USER_ROLES } = require('../../config/constant');
const  User  = require('../../db/models/Users/User');

module.exports.isUser = async (req, res, next) => {
  try {
    //getting authToken from headers
    let authToken = req.headers['authorization'];

    //check if authToken starts with Bearer, fetch the token or return error
    if (authToken && authToken.startsWith('Bearer ')) {
      //if token start with Bearer
      authToken = authToken.split(' ')[1];
    } else {
      //if token is not provided then send validation response
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        status: HTTP_STATUS_CODE.UNAUTHORIZED,
        errorCode: '',
        message: req.__('User.Auth.TokenNotFound'),
        data: {},
        error: '',
      });
    }

    //verify jwt token based on jwt key
    let decodedToken = JWT.verify(authToken, process.env.JWT_KEY);

    //if request from guest token then and then proceed
    if (decodedToken.loginMethod === USER_ROLES.USER) {
      return next();
    }

    //check for decodedToken expiry
    if (
      decodedToken &&
      decodedToken.exp &&
      decodedToken.exp > Math.floor(Date.now() / 1000)
    ) {
      if (decodedToken.id) {
        let user = await User.findOne({
          where: {
            id: decodedToken.id,
            isDeleted: false,
          },
          attributes: [
            'id',
            'email',
            'name',
            'authToken',
            'socialMediaId',
            'gender',
            'dateOfBirth',
            'age',
            'phone',
          ],
        });

        if (!user) {
          //if user is not found in database then send validation response
          return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
            status: HTTP_STATUS_CODE.UNAUTHORIZED,
            errorCode: '',
            message: req.__('User.Auth.Invalid'),
            data: {},
            error: '',
          });
        }

        /* checks token from header with current token stored in database for that user
          if that doesn't matches then send validation response */
        if (user.authToken !== authToken) {
          return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
            status: HTTP_STATUS_CODE.FORBIDDEN,
            errorCode: '',
            message: req.__('User.Auth.TokenMismatch'),
            data: {},
            error: '',
          });
        }

        req.headers.userData = user;
        next();
      } else {
        return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODE.UNAUTHORIZED,
          errorCode: '',
          message: req.__('User.Auth.Invalid'),
          data: {},
          error: '',
        });
      }
    } else {
      return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
        status: HTTP_STATUS_CODE.FORBIDDEN,
        errorCode: '',
        message: req.__('User.Auth.TokenExpired'),
        data: {},
        error: '',
      });
    }
  } catch (error) {
    //if error is of jwt token expire then send validation response with errorcode 'AUTH004'
    if (error instanceof JWT.TokenExpiredError) {
      return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
        status: HTTP_STATUS_CODE.FORBIDDEN,
        errorCode: '',
        message: req.__('User.Auth.TokenExpired'),
        data: {},
        error: '',
      });
    } else {
      //send server error response
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        errorCode: '',
        message: '',
        data: {},
        error: error.message,
      });
    }
  }
};