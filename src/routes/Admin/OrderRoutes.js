const express = require("express");

// Routes
const router = express.Router();

// Controllers
const OrderController = require("../../controllers/Admin/OrderController");

// middleware for check user
const { isAdmin } = require("../../middlewares/AdminTokenCheck");

// Routes for controllers
router.get("/getAllOrder", isAdmin, OrderController.getAllOrders);
router.get("/getOrderById", isAdmin, OrderController.getOrderById);
router.get("/getOrderByUserId", isAdmin, OrderController.getOrderByUserId);
// Export routes
module.exports = router;
