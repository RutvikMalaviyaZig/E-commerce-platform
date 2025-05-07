const { UUID } = require('../../../config/constant');
const ErrorLog = require('../../../db/models/ErrorLog');
const generateError = async function ({ apiName, details }) {
  try {
    // Ensure it is not test server and required fields are provided

    if (process.env.NODE_ENV === 'test' || !apiName || !details) {
      return;
    }

    // creating the error in the database
    await ErrorLog.create({
      id: UUID(),
      api: apiName,
      errorDetail: details,
    });
  } catch (error) {
    console.error('Failed to log error:', error);
    throw error;
  }
};

module.exports = { generateError };
