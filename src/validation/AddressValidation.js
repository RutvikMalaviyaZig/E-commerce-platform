const { VALIDATION_EVENTS, VALIDATOR } = require("../../config/constant");

const validateAddress = (bodyData) => {
  let rules;
  let result = {};
  switch (bodyData.eventCode) {
    case VALIDATION_EVENTS.CREATE_ADDRESS: {
      // Data validation rules
      rules = {
        fullName: "string|required",
        phoneNumber: "string|required",
        street: "string|required",
        city: "string|required",
        state: "string|required",
        country: "string|required",
        postalCode: "string|required",
        typeOfAddress: "string",
      };

      break;
    }

    case VALIDATION_EVENTS.UPDATE_ADDRESS: {
      // Data validation rules
      rules = {
        addressId: "string|required",
        fullName: "string|required",
        phoneNumber: "string|required",
        street: "string|required",
        city: "string|required",
        state: "string|required",
        country: "string|required",
        postalCode: "string|required",
        typeOfAddress: "string",
      };

      break;
    }

    case VALIDATION_EVENTS.DELETE_ADDRESS: {
      // Data validation rules
      rules = {
        addressId: "string|required",
        userId: "string|required",
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

module.exports = { validateAddress };
