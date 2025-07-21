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
router.delete("/deleteUser",isAdmin, AdminController.deleteUserByAdminAndSuperAdmin);
router.delete("/deleteUserOrAdmin",isAdmin, AdminController.deleteUserOrAdminBySuperAdmin);
router.put("/editUser",isAdmin, AdminController.editUserByAdminOrSuperAdmin);
router.put("/editUserOrAdmin",isAdmin, AdminController.editUserOrAdminBySuperAdmin);
router.get("/adminList",isAdmin, AdminController.getAdminList);
router.get("/userList",isAdmin, AdminController.getUserList);
router.post("/createUser",isAdmin, AdminController.createUserByAdminOrSuperAdmin);
router.post("/createUserOrAdmin",isAdmin, AdminController.createAdminOrUserBySuperAdmin);

// Export routes
module.exports = router;
