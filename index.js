// Load environment variables
require("dotenv").config();

// load modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Load Routes
const router = require("./src/routes/index");

// Load config
const { locales, defaultLocale } = require("./config/i18n");

// load utilities
const { createServer } = require("http");
const { I18n } = require("i18n");

const app = express();
// create server
const server = createServer(app);

// load port
const PORT = process.env.PORT || 3000;

// set cors option
let corsOptions = {
  origin: "*",
};
// Load i18n
const i18n = new I18n({
  locales,
  directory: __dirname + "/config/locales",
  defaultLocale,
  objectNotation: true,
  updateFiles: false,
});

//middleware
app.use(express.json());
app.use(cors(corsOptions));

// Set i18n
app.use(i18n.init);

// Load database
const sequelize = require("./config/database");
const { startServer } = require("./src/utils/server");

// test api
app.get("/", async (req, res) => {
  res.send("welcome to E-commerce");
});

// router
app.use("/api", router);

// start server
server.listen(PORT, async (req, res) => {
  await startServer(sequelize, PORT);
  console.log(`✅ API running at http://localhost:${PORT}`);
});
