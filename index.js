// Load environment variables
require('dotenv').config();

// load modules
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");

// load utilities
const { createServer } = require('http');

const app = express();
// create server
const server = createServer(app);

// load port
const PORT = process.env.PORT || 3000;

// set cors option
let corsOptions = {
  origin: "*",
};

//middleware
app.use(express.json());
app.use(cors(corsOptions));

// Load database
const  sequelize  = require("./config/database");
const { startServer } = require("./src/utils/server");

// test api
app.get("/", async (req, res) => {
  res.send("welcome to E-commerce");
});

// start server
server.listen(PORT, async (req, res) => {
  await startServer( sequelize,PORT)
  console.log(`✅ API running at http://localhost:${PORT}`);
});
