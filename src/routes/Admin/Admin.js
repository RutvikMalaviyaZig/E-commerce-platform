const express = require("express");

// Routes
const router = express.Router();

// Controllers
const AdminController = require("../../controllers/Admin/AdminController");

// middleware for check user
const { isAdmin } = require("../../middlewares/AdminTokenCheck");

// Routes for controllers
router.get("/getProfile",isAdmin, AdminController.getProfile);
router.put("/editProfile",isAdmin, AdminController.editProfile);

// Export routes
module.exports = router;
