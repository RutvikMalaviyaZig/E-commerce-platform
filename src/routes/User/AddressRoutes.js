const express = require("express");

// Routes
const router = express.Router();

// Controllers
const AddressController = require("../../controllers/User/AddressController");

// middleware for check user
const { isUser } = require("../../middlewares/UserTokenCheck");

// Routes for controllers
router.post("/createAddress", isUser, AddressController.createAddress);
router.put("/updateAddress", isUser, AddressController.updateAddress);
router.delete("/deleteAddress", isUser, AddressController.deleteAddress);
router.get("/listAddress", isUser, AddressController.listAddress);

// Export routes
module.exports = router;
