# Stripe Payment Gateway Integration

This document explains how to set up and use Stripe payment gateway in your e-commerce platform.

## Setup Instructions

### 1. Install Dependencies

The Stripe package has already been installed:

```bash
npm install stripe
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe URLs (optional - will use defaults if not set)
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel
```

### 3. Database Migration

Run the migration to add Stripe fields to the orders table:

```bash
npx sequelize-cli db:migrate
```

### 4. Stripe Account Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Set up webhooks in your Stripe Dashboard:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain.com/payment/webhook`
   - Select events: `payment_intent.succeeded`, `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy the webhook secret and add it to your environment variables

## API Endpoints

### 1. Create Payment Intent

**POST** `/payment/create-payment-intent`

Creates a payment intent for client-side payment processing.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "quantity": 2,
  "addressId": "address-uuid"
}
```

**Response:**

```json
{
  "status": 200,
  "message": "Payment intent created successfully",
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 5000
  }
}
```

### 2. Confirm Payment

**POST** `/payment/confirm-payment`

Confirms a payment and creates an order.

**Request Body:**

```json
{
  "paymentIntentId": "pi_xxx"
}
```

### 3. Create Checkout Session

**POST** `/payment/create-checkout-session`

Creates a Stripe checkout session for redirect-based payment.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "quantity": 2,
  "addressId": "address-uuid"
}
```

**Response:**

```json
{
  "status": 200,
  "message": "Checkout session created successfully",
  "data": {
    "sessionId": "cs_xxx",
    "sessionUrl": "https://checkout.stripe.com/xxx"
  }
}
```

### 4. Webhook Handler

**POST** `/payment/webhook`

Handles Stripe webhook events (no authentication required).

## Frontend Integration

### Option 1: Payment Element (Recommended)

```javascript
// 1. Create payment intent
const response = await fetch("/payment/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userToken,
  },
  body: JSON.stringify({
    productId: "product-uuid",
    quantity: 2,
    addressId: "address-uuid",
  }),
});

const { clientSecret } = await response.json();

// 2. Initialize Stripe
const stripe = Stripe("pk_test_your_publishable_key");

// 3. Create payment element
const elements = stripe.elements();
const paymentElement = elements.create("payment");
paymentElement.mount("#payment-element");

// 4. Handle form submission
const form = document.getElementById("payment-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: "https://your-domain.com/payment/success",
    },
  });

  if (error) {
    console.error("Payment failed:", error);
  }
});
```

### Option 2: Checkout Session (Redirect)

```javascript
// 1. Create checkout session
const response = await fetch("/payment/create-checkout-session", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userToken,
  },
  body: JSON.stringify({
    productId: "product-uuid",
    quantity: 2,
    addressId: "address-uuid",
  }),
});

const { sessionUrl } = await response.json();

// 2. Redirect to Stripe Checkout
window.location.href = sessionUrl;
```

## Order Flow

1. **User selects product** → Frontend calls `/payment/create-payment-intent`
2. **Payment processing** → User completes payment on frontend or Stripe Checkout
3. **Webhook notification** → Stripe sends webhook to `/payment/webhook`
4. **Order creation** → Backend creates order with payment status
5. **Order confirmation** → User receives confirmation

## Security Considerations

1. **Never expose secret keys** on the frontend
2. **Always verify webhook signatures** (already implemented)
3. **Use HTTPS** in production
4. **Validate all input data** (already implemented)
5. **Handle payment failures** gracefully

## Testing

### Test Cards

Use these test card numbers in Stripe test mode:

- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Requires Authentication**: `4000002500003155`

### Test Mode vs Live Mode

- Use test keys for development and testing
- Switch to live keys for production
- Test webhooks using Stripe CLI: `stripe listen --forward-to localhost:3000/payment/webhook`

## Error Handling

The integration includes comprehensive error handling:

- Payment failures are logged and orders are marked as failed
- Webhook verification prevents unauthorized requests
- Database transactions ensure data consistency
- Error logging for debugging

## Support

For Stripe-specific issues, refer to:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Support](https://support.stripe.com)
