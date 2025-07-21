const {
  VALIDATION_EVENTS,
  VALIDATOR,
} = require("../../config/constant");

const validateCategory = (bodyData) => {
  let rules;
  let result = {};
  switch (bodyData.eventCode) {
    case VALIDATION_EVENTS.CREATE_CATEGORY: {
      // Data validation rules
      rules = {
        id: "string|required",
        categoryName: "string|required",
      };

      break;
    }

    case VALIDATION_EVENTS.UPDATE_CATEGORY: {
      // Data validation rules
      rules = {
        id: "string|required",
        categoryId : "string|required",
        categoryName : "string|required",
      };

      break;
    }

    case VALIDATION_EVENTS.DELETE_CATEGORY: {
      // Data validation rules
      rules = {
        id: "string|required",
        categoryId: "string|required",
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

module.exports = { validateCategory };
