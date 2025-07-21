const express = require("express");

// Routes
const router = express.Router();

// Controllers
const UserController = require("../../controllers/User/UserController");

// middleware for check user
const { isUser } = require("../../middlewares/UserTokenCheck");

// Routes for controllers
router.get("/getProfile",isUser, UserController.getProfile);
router.put("/editProfile",isUser, UserController.editProfile);

// Export routes
module.exports = router;
