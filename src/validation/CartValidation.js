const { VALIDATION_EVENTS, VALIDATOR } = require("../../config/constant");

const validateCart = (bodyData) => {
  let rules;
  let result = {};
  switch (bodyData.eventCode) {
    case VALIDATION_EVENTS.ADD_TO_CART: {
      // Data validation rules
      rules = {
        id: "string|required",
        productId: "string|required",
        isAddedCart: "boolean|required",
      };

      break;
    }

    case VALIDATION_EVENTS.REMOVE_FROM_CART: {
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

module.exports = { validateCart };
