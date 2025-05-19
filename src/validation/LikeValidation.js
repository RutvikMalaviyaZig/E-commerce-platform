const { VALIDATION_EVENTS, VALIDATOR } = require("../../config/constant");

const validateLike = (bodyData) => {
  let rules;
  let result = {};
  switch (bodyData.eventCode) {
    case VALIDATION_EVENTS.LIKE_PRODUCT: {
      // Data validation rules
      rules = {
        id: "string|required",
        productId: "string|required",
        like: "boolean|required",
      };

      break;
    }

    case VALIDATION_EVENTS.DISLIKE_PRODUCT: {
      // Data validation rules
      rules = {
        id: "string|required",
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

module.exports = { validateLike };
