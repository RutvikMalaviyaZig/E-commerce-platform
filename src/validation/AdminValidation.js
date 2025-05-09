const {
  VALIDATION_EVENTS,
  VALIDATOR,
  GENDER,
} = require("../../config/constant");

const validateAdmin = (bodyData) => {
  let rules;
  let result = {};
  switch (bodyData.eventCode) {
    case VALIDATION_EVENTS.UPDATE_ADMIN: {
      // Data validation rules
      rules = {
        id: "string|required",
        name: "string",
        email: "string|email",
        phone: "string",
        gender: [
          {
            in: [GENDER.MALE, GENDER.FEMALE],
          },
        ],
        dateOfBirth: "string",
        countryCode: "string",
        profileImageId: "string",
      };

      break;
    }

    case VALIDATION_EVENTS.VIEW_ADMIN: {
      // Data validation rules
      rules = {
        id: "string|required",
      };

      break;
    }

    case VALIDATION_EVENTS.DELETE_USER_BY_ADMIN_OR_SUPER_ADMIN: {
      // Data validation rules
      rules = {
        id: "string|required",
        userId: "string|required",
      };

      break;
    }
    case VALIDATION_EVENTS.DELETE_USER_OR_ADMIN_BY_SUPER_ADMIN: {
      // Data validation rules
      rules = {
        id: "string|required",
        userId: "string|required",
        userRole: "string|required",
      };

      break;
    }

    case VALIDATION_EVENTS.UPDATE_USER_BY_ADMIN_OR_SUPER_ADMIN: {
      // Data validation rules
      rules = {
        id: "string|required",
        userId: "string|required",
        name: "string",
        email: "string|email",
        phone: "string",
        gender: [
          {
            in: [GENDER.MALE, GENDER.FEMALE],
          },
        ],
        dateOfBirth: "string",
        countryCode: "string",
      };

      break;
    }
    case VALIDATION_EVENTS.UPDATE_USER_OR_ADMIN_BY_SUPER_ADMIN: {
      // Data validation rules
      rules = {
        id: "string|required",
        userId: "string|required",
        userRole: "string|required",
        name: "string",
        email: "string|email",
        phone: "string",
        gender: [
          {
            in: [GENDER.MALE, GENDER.FEMALE],
          },
        ],
        dateOfBirth: "string",
        countryCode: "string",
      };

      break;
    }
    case VALIDATION_EVENTS.CREATE_ADMIN_OR_USER: {
      // Data validation rules
      rules = {
        id: "string|required",
        creatorRole : "string|required",
        name: "string|required",
        email: "string|email",
        phone: "string",
        gender: [
          {
            in: [GENDER.MALE, GENDER.FEMALE],
          },
        ],
        dateOfBirth: "string|required",
        countryCode: "string",
        password : "string",
        role: "string|required",
      };

      break;
    }
    case VALIDATION_EVENTS.CREATE_USER_BY_ADMIN_OR_SUPER_ADMIN: {
      // Data validation rules
      rules = {
        name: "string|required",
        email: "string|email",
        phone: "string",
        gender: [
          {
            in: [GENDER.MALE, GENDER.FEMALE],
          },
        ],
        dateOfBirth: "string|required",
        countryCode: "string",
        password : "string",
        role: "string|required",
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

module.exports = { validateAdmin };
