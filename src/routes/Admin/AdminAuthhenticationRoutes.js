const express = require("express");

// Routes
const router = express.Router();

// Controllers
const AdminAuthController = require("../../controllers/Admin/AdminAuthController");

// middleware for check user
const { isAdmin } = require("../../middlewares/AdminTokenCheck");

// Routes for controllers
router.post("/signup", AdminAuthController.signupWithEmail);
router.post("/login", AdminAuthController.loginWithEmail);
router.post("/logout", isAdmin, AdminAuthController.logout);
router.post("/deleteAccount", isAdmin, AdminAuthController.deleteAccount);

// Export routes
module.exports = router;
