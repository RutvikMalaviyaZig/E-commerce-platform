const { TOKEN_EXPIRY } = require('../../../config/constant');
const  Device  = require('../../../db/models/Device');
const { generateToken } = require('../../helper/Auth/generateToken');

const deviceRegister = async (data) => {
  try {
    const deviceData = await Device.findOne({
      where: {
        deviceId: data.deviceId,
        isDeleted: false,
      },
      attributes: ['id'],
    });

    const refreshToken = await generateToken(
      data,
      TOKEN_EXPIRY.USER_REFRESH_TOKEN
    );

    if (!deviceData) {
      await Device.create({
        userId: data.userId,
        deviceId: data.deviceId,
        deviceToken: data.deviceToken,
        osType: data.osType,
        appVersion: data.appVersion,
        refreshToken,
      });
    } else {
      await Device.update(
        {
          userId: data.userId,
          deviceToken: data.deviceToken,
          osType: data.osType,
          appVersion: data.appVersion,
          refreshToken,
        },
        {
          where: {
            deviceId: data.deviceId,
            isDeleted: false,
          },
        }
      );
    }

    return refreshToken;
  } catch (error) {
    console.log('error: ', error);

    return false;
  }
};

module.exports = { deviceRegister };
