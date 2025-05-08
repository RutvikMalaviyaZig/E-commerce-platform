const {
    VALIDATION_EVENTS,
    VALIDATOR,
    GENDER,
  } = require('../../config/constant');
  
  const validateUser = (bodyData) => {
    let rules;
    let result = {};
    switch (bodyData.eventCode) {
      case VALIDATION_EVENTS.UPDATE_USER: {
        // Data validation rules
        rules = {
          id: 'string|required',
          name: 'string',
          email: 'string|email',
          phone: 'string',
          gender: [
            {
              in: [GENDER.MALE, GENDER.FEMALE],
            },
          ],
          dateOfBirth: 'string',
          countryCode: 'string',
          profileImageId: 'string',
        };
  
        break;
      }
  
      case VALIDATION_EVENTS.VIEW_USER: {
        // Data validation rules
        rules = {
          id: 'string|required',
        };
  
        break;
      }
    }
  
    let validation = new VALIDATOR(bodyData, rules);
  
    if (validation.passes()) {
      result['hasError'] = false;
    }
    if (validation.fails()) {
      result['hasError'] = true;
      result['errors'] = validation.errors.all();
    }
    return result;
  };
  
  module.exports = { validateUser };
  