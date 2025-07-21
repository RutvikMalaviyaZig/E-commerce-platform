const express = require("express");

// Routes
const router = express.Router();

// Controllers
const AddressController = require("../../controllers/Admin/AddressController");

// middleware for check user
const { isAdmin } = require("../../middlewares/AdminTokenCheck");

// Routes for controllers
router.post("/createAddress", isAdmin, AddressController.createAddress);
router.put("/updateAddress", isAdmin, AddressController.updateAddress);
router.delete("/deleteAddress", isAdmin, AddressController.deleteAddress);
router.get("/listAddress", isAdmin, AddressController.listAddress);

// Export routes
module.exports = router;
