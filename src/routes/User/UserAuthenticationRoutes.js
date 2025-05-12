const express = require("express");

// Routes
const router = express.Router();

// Controllers
const UserAuthController = require("../../controllers/User/UserAuthController");

// middleware for check user
const { isUser } = require("../../middlewares/UserTokenCheck");

// Routes for controllers
router.post("/signup", UserAuthController.signupWithEmail);
router.post("/login", UserAuthController.loginWithEmail);
router.post("/login-phone", UserAuthController.loginWithPhone);
router.post("/logout", isUser, UserAuthController.logout);
router.post("/deleteAccount",isUser, UserAuthController.deleteAccount)

// Export routes
module.exports = router;
