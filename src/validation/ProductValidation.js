const {
  VALIDATION_EVENTS,
  VALIDATOR,
} = require("../../config/constant");

const validateCategory = (bodyData) => {
  let rules;
  let result = {};
  switch (bodyData.eventCode) {
    case VALIDATION_EVENTS.CREATE_PRODUCT: {
      // Data validation rules
      rules = {
        id: "string|required",
        categoryName: "string|required",
        productImageId : "string|required",
        productName: "string|required",
        price: "string|required",
        currencySymbol:"string|required",
        productDescription :"string|required",
        rating : "string|required",
        review : "string|required",
        specification : "string|required",
        otherDetails : "string|required",
        discount : "string|required",
        availableOffers : "string|required",
      };

      break;
    }

    case VALIDATION_EVENTS.UPDATE_PRODUCT: {
      // Data validation rules
      rules = {
        id: "string|required",
        categoryId : "string|required",
        categoryName : "string|required",
        productImageId : "string|required",
        productName: "string|required",
        price: "string|required",
        currencySymbol:"string|required",
        productDescription :"string|required",
        rating : "string|required",
        review : "string|required",
        specification : "string|required",
        otherDetails : "string|required",
        discount : "string|required",
        availableOffers : "string|required",
      };

      break;
    }

    case VALIDATION_EVENTS.DELETE_PRODUCT: {
      // Data validation rules
      rules = {
        id: "string|required",
        productId: "string|required",
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
