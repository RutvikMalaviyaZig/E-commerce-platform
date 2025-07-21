const moment = require("moment");

const taskDate = 1750917481;
const taskTime = "11:28:00";

const taskDateTime = moment(
  `${moment.unix(taskDate).format("YYYY-MM-DD")} ${taskTime}`,
  "YYYY-MM-DD HH:mm:ss"
);
console.log(`Task DateTime: ${taskDateTime}`);
