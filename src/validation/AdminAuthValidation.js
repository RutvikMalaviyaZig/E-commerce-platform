const {
    VALIDATION_EVENTS,
    VALIDATOR,
    GENDER,
  } = require("../../config/constant");
  
  const validateAdminAuth = (bodyData) => {
    let rules;
    let result = {};
    switch (bodyData.eventCode) {
      case VALIDATION_EVENTS.LOGIN_ADMIN: {
        // Data validation rules
        rules = {
          email: "string|required",
          password: "string|required|min:8|max:30",
        };
        break;
      }
      case VALIDATION_EVENTS.FORGOT_PASSWORD: {
        // Data validation rules
        rules = {
          email: "string|required|email",
        };
  
        break;
      }
      case VALIDATION_EVENTS.RESET_PASSWORD: {
        // Data validation rules
        rules = {
          token: "string|required",
          password: "string|required|min:8|max:30",
        };
  
        break;
      }
  
      case VALIDATION_EVENTS.ADMIN_SIGNUP_EMAIL: {
        rules = {
          name: "string|required",
          email: "string|required|email",
          gender: [
            "required",
            {
              in: [GENDER.MALE, GENDER.FEMALE],
            },
          ],
          dateOfBirth: "string|required",
          password: "string|required",
        };
  
        break;
      }
  
      case VALIDATION_EVENTS.ADMIN_LOGIN_EMAIL: {
        rules = {
          email: "string|required|email",
          password : "string|required",
        };
  
        break;
      }
  
  
      case VALIDATION_EVENTS.ADMIN_LOGOUT: {
        rules = {
          id: "string|required",
        };
  
        break;
      }
  
      case VALIDATION_EVENTS.AFTER_SET_PASSWORD: {
        rules = {
          userId: "string|required",
          token: "string|required",
        };
  
        break;
      }
  
      case VALIDATION_EVENTS.VERIFY_LINK: {
        rules = {
          userId: "string|required",
          token: "string|required",
        };
  
        break;
      }
    }
  
    let validation = new VALIDATOR(bodyData, rules);
  
    if (validation.passes()) {
      result["hasError"] = false;
    }
    if (validation.fails()) {
      result["hasError"] = true;
      result["errors"] = validation.errors.all();
    }
    return result;
  };
  
  module.exports = { validateAdminAuth };
  