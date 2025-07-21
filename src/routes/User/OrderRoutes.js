const express = require("express");

// Routes
const router = express.Router();

// Controllers
const OrderController = require("../../controllers/User/OrderController");

// middleware for check user
const { isUser } = require("../../middlewares/UserTokenCheck");

// Routes for controllers
router.post("/createOrder", isUser, OrderController.createOrder);
router.delete("/deleteOrder", isUser, OrderController.deleteOrder);
router.get("/listOrder", isUser, OrderController.listOrder);
router.get("/getOrderById", isUser, OrderController.getOrderById);

// Export routes
module.exports = router;
