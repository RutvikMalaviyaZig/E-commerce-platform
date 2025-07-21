const express = require("express");

// Routes
const router = express.Router();

// Controllers
const PaymentController = require("../../controllers/User/PaymentController");

// middleware for check user
const { isUser } = require("../../middlewares/UserTokenCheck");

// Middleware for raw body parsing (needed for webhooks)
const rawBodyMiddleware = express.raw({ type: "application/json" });

// Routes for payment controllers
router.post(
  "/create-payment-intent",
  isUser,
  PaymentController.createPaymentIntent
);
router.post("/confirm-payment", isUser, PaymentController.confirmPayment);
router.post(
  "/create-checkout-session",
  isUser,
  PaymentController.createCheckoutSession
);

// Webhook route (no authentication needed, Stripe handles security)
router.post("/webhook", rawBodyMiddleware, PaymentController.handleWebhook);

// Export routes
module.exports = router;
