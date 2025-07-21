const {
  HTTP_STATUS_CODE,
  VALIDATION_EVENTS,
} = require("../../../config/constant");
const { generateError } = require("../../helper/error/generateError");
const { stripe, config } = require("../../../config/stripe");
const Order = require("../../../db/models/Orders/Orders");
const Product = require("../../../db/models/Product/Product");
const Address = require("../../../db/models/Address/Address");
const sequelize = require("../../../config/database");

module.exports = {
  /**
   * @name createPaymentIntent
   * @file PaymentController.js
   * @param {Request} req
   * @param {Response} res
   * @description Create a payment intent for Stripe payment
   * @author Rutvik Malaviya
   */
  createPaymentIntent: async (req, res) => {
    try {
      const { productId, quantity, addressId } = req.body;
      const userId = req.headers.userData.id;

      // Validate required fields
      if (!productId || !quantity || !addressId) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "Product ID, quantity, and address ID are required",
          data: {},
          error: "",
        });
      }

      // Check if product exists
      const product = await Product.findOne({
        where: {
          id: productId,
          isDeleted: false,
        },
      });

      if (!product) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "Product not found",
          data: {},
          error: "",
        });
      }

      // Check if address exists
      const address = await Address.findOne({
        where: {
          id: addressId,
          isDeleted: false,
        },
      });

      if (!address) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "Address not found",
          data: {},
          error: "",
        });
      }

      // Calculate total price (assuming product has a price field)
      const totalPrice = product.price * quantity;

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice * 100, // Stripe expects amount in cents
        currency: config.currency,
        payment_method_types: config.paymentMethodTypes,
        metadata: {
          userId,
          productId,
          quantity,
          addressId,
          totalPrice,
        },
      });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "Payment intent created successfully",
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: totalPrice,
        },
        error: "",
      });
    } catch (error) {
      await generateError({
        apiName: "User- PaymentController - createPaymentIntent",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name confirmPayment
   * @file PaymentController.js
   * @param {Request} req
   * @param {Response} res
   * @description Confirm payment and create order
   * @author Rutvik Malaviya
   */
  confirmPayment: async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      const userId = req.headers.userData.id;

      if (!paymentIntentId) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "Payment intent ID is required",
          data: {},
          error: "",
        });
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (paymentIntent.status !== "succeeded") {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "Payment not completed",
          data: {},
          error: "",
        });
      }

      // Extract metadata
      const { productId, quantity, addressId, totalPrice } =
        paymentIntent.metadata;

      // Create order in database
      await sequelize.transaction(async (transaction) => {
        await Order.create(
          {
            userId,
            productId,
            quantity: parseInt(quantity),
            totalPrice: parseInt(totalPrice),
            addressId,
            paymentMethod: "stripe",
            paymentStatus: "paid",
            status: "processing",
            trackingNumber: require("../../../config/constant").UUID(),
            stripePaymentIntentId: paymentIntentId,
          },
          { transaction }
        );
      });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "Payment confirmed and order created successfully",
        data: {
          paymentIntentId,
          orderStatus: "processing",
        },
        error: "",
      });
    } catch (error) {
      await generateError({
        apiName: "User- PaymentController - confirmPayment",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name createCheckoutSession
   * @file PaymentController.js
   * @param {Request} req
   * @param {Response} res
   * @description Create a Stripe checkout session for redirect-based payment
   * @author Rutvik Malaviya
   */
  createCheckoutSession: async (req, res) => {
    try {
      const { productId, quantity, addressId } = req.body;
      const userId = req.headers.userData.id;

      // Validate required fields
      if (!productId || !quantity || !addressId) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "Product ID, quantity, and address ID are required",
          data: {},
          error: "",
        });
      }

      // Check if product exists
      const product = await Product.findOne({
        where: {
          id: productId,
          isDeleted: false,
        },
      });

      if (!product) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "Product not found",
          data: {},
          error: "",
        });
      }

      // Calculate total price
      const totalPrice = product.price * quantity;

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: config.paymentMethodTypes,
        line_items: [
          {
            price_data: {
              currency: config.currency,
              product_data: {
                name: product.productName,
                description: product.description || "Product purchase",
              },
              unit_amount: product.price * 100, // Convert to cents
            },
            quantity,
          },
        ],
        mode: "payment",
        success_url: `${config.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: config.cancelUrl,
        metadata: {
          userId,
          productId,
          quantity,
          addressId,
          totalPrice,
        },
      });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "Checkout session created successfully",
        data: {
          sessionId: session.id,
          sessionUrl: session.url,
        },
        error: "",
      });
    } catch (error) {
      await generateError({
        apiName: "User- PaymentController - createCheckoutSession",
        details: error?.message ? error.message : JSON.stringify(error),
      });
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: {},
        error: error.message,
      });
    }
  },

  /**
   * @name handleWebhook
   * @file PaymentController.js
   * @param {Request} req
   * @param {Response} res
   * @description Handle Stripe webhook events
   * @author Rutvik Malaviya
   */
  handleWebhook: async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.webhookSecret
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      case "checkout.session.completed":
        const session = event.data.object;
        await handleCheckoutSuccess(session);
        break;
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  },
};

/**
 * Handle successful payment intent
 */
async function handlePaymentSuccess(paymentIntent) {
  try {
    const { userId, productId, quantity, addressId, totalPrice } =
      paymentIntent.metadata;

    // Update or create order
    await sequelize.transaction(async (transaction) => {
      const existingOrder = await Order.findOne({
        where: {
          stripePaymentIntentId: paymentIntent.id,
        },
        transaction,
      });

      if (existingOrder) {
        await existingOrder.update(
          {
            paymentStatus: "paid",
            status: "processing",
          },
          { transaction }
        );
      } else {
        await Order.create(
          {
            userId,
            productId,
            quantity: parseInt(quantity),
            totalPrice: parseInt(totalPrice),
            addressId,
            paymentMethod: "stripe",
            paymentStatus: "paid",
            status: "processing",
            trackingNumber: require("../../../config/constant").UUID(),
            stripePaymentIntentId: paymentIntent.id,
          },
          { transaction }
        );
      }
    });
  } catch (error) {
    await generateError({
      apiName: "PaymentController - handlePaymentSuccess",
      details: error?.message ? error.message : JSON.stringify(error),
    });
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSuccess(session) {
  try {
    const { userId, productId, quantity, addressId, totalPrice } =
      session.metadata;

    await sequelize.transaction(async (transaction) => {
      await Order.create(
        {
          userId,
          productId,
          quantity: parseInt(quantity),
          totalPrice: parseInt(totalPrice),
          addressId,
          paymentMethod: "stripe",
          paymentStatus: "paid",
          status: "processing",
          trackingNumber: require("../../../config/constant").UUID(),
          stripeSessionId: session.id,
        },
        { transaction }
      );
    });
  } catch (error) {
    await generateError({
      apiName: "PaymentController - handleCheckoutSuccess",
      details: error?.message ? error.message : JSON.stringify(error),
    });
  }
}

/**
 * Handle payment failure
 */
async function handlePaymentFailure(paymentIntent) {
  try {
    await sequelize.transaction(async (transaction) => {
      const order = await Order.findOne({
        where: {
          stripePaymentIntentId: paymentIntent.id,
        },
        transaction,
      });

      if (order) {
        await order.update(
          {
            paymentStatus: "failed",
            status: "cancelled",
          },
          { transaction }
        );
      }
    });
  } catch (error) {
    await generateError({
      apiName: "PaymentController - handlePaymentFailure",
      details: error?.message ? error.message : JSON.stringify(error),
    });
  }
}
