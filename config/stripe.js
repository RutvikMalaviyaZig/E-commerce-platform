const stripe = require("stripe");

// Initialize Stripe with your secret key
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Stripe configuration
const stripeConfig = {
  // Currency for payments (you can change this based on your requirements)
  currency: "usd",

  // Payment method types you want to accept
  paymentMethodTypes: ["card"],

  // Webhook endpoint secret for verifying webhook signatures
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  // Success and cancel URLs for payment redirects
  successUrl:
    process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/payment/success",
  cancelUrl:
    process.env.STRIPE_CANCEL_URL || "http://localhost:3000/payment/cancel",
};

module.exports = {
  stripe: stripeInstance,
  config: stripeConfig,
};
