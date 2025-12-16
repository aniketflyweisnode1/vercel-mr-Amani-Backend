const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const {
  createPaymentIntent,
  getPaymentIntent,
  confirmPaymentIntent,
  cancelPaymentIntent,
  createCustomer,
  createRefund,
  verifyWebhookSignature,
  verifyPaymentStatus,
  getPaymentIntentById
} = require('../../utils/stripe');

/**
 * Create a payment intent
 * @route   POST /api/v2/stripe/create-payment-intent
 * @access  Public
 */
const createPaymentIntentHandler = asyncHandler(async (req, res) => {
  try {
    const { amount, currency, customerEmail, billingDetails, metadata } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return sendError(res, 'Amount is required and must be a positive number', 400);
    }

    const result = await createPaymentIntent({
      amount,
      currency,
      customerEmail,
      billingDetails,
      metadata
    });

    return sendSuccess(res, result, 'Payment intent created successfully', 201);
  } catch (error) {
    console.error('Error creating payment intent', { error: error.message });
    return sendError(res, error.message || 'Failed to create payment intent', 500);
  }
});

/**
 * Get payment intent details
 * @route   GET /api/v2/stripe/payment-intent/:id
 * @access  Public
 */
const getPaymentIntentHandler = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, 'Payment intent ID is required', 400);
    }

    const result = await getPaymentIntent(id);
    return sendSuccess(res, result, 'Payment intent retrieved successfully', 200);
  } catch (error) {
    console.error('Error retrieving payment intent', { error: error.message });
    return sendError(res, error.message || 'Failed to retrieve payment intent', 500);
  }
});

/**
 * Confirm payment intent
 * @route   POST /api/v2/stripe/confirm-payment-intent
 * @access  Public
 */
const confirmPaymentIntentHandler = asyncHandler(async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId) {
      return sendError(res, 'Payment intent ID is required', 400);
    }

    const result = await confirmPaymentIntent(paymentIntentId, paymentMethodId);
    return sendSuccess(res, result, 'Payment intent confirmed successfully', 200);
  } catch (error) {
    console.error('Error confirming payment intent', { error: error.message });
    return sendError(res, error.message || 'Failed to confirm payment intent', 500);
  }
});

/**
 * Cancel payment intent
 * @route   POST /api/v2/stripe/cancel-payment-intent
 * @access  Public
 */
const cancelPaymentIntentHandler = asyncHandler(async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return sendError(res, 'Payment intent ID is required', 400);
    }

    const result = await cancelPaymentIntent(paymentIntentId);
    return sendSuccess(res, result, 'Payment intent cancelled successfully', 200);
  } catch (error) {
    console.error('Error cancelling payment intent', { error: error.message });
    return sendError(res, error.message || 'Failed to cancel payment intent', 500);
  }
});

/**
 * Create a customer
 * @route   POST /api/v2/stripe/create-customer
 * @access  Public
 */
const createCustomerHandler = asyncHandler(async (req, res) => {
  try {
    const { email, name, phone, metadata } = req.body;

    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    const result = await createCustomer({
      email,
      name,
      phone,
      metadata
    });

    return sendSuccess(res, result, 'Customer created successfully', 201);
  } catch (error) {
    console.error('Error creating customer', { error: error.message });
    return sendError(res, error.message || 'Failed to create customer', 500);
  }
});

/**
 * Create a refund
 * @route   POST /api/v2/stripe/create-refund
 * @access  Public
 */
const createRefundHandler = asyncHandler(async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return sendError(res, 'Payment intent ID is required', 400);
    }

    const result = await createRefund(paymentIntentId, amount, reason);
    return sendSuccess(res, result, 'Refund created successfully', 201);
  } catch (error) {
    console.error('Error creating refund', { error: error.message });
    return sendError(res, error.message || 'Failed to create refund', 500);
  }
});

/**
 * Verify webhook signature
 * @route   POST /api/v2/stripe/webhook
 * @access  Public
 */
const webhookHandler = asyncHandler(async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = req.body.webhookSecret;

    if (!signature) {
      return sendError(res, 'Stripe signature header is required', 400);
    }

    if (!webhookSecret) {
      return sendError(res, 'Webhook secret is required', 400);
    }

    // Get raw body for webhook verification
    const payload = JSON.stringify(req.body);

    const result = verifyWebhookSignature(payload, signature, webhookSecret);
    return sendSuccess(res, result.event, 'Webhook verified successfully', 200);
  } catch (error) {
    console.error('Error verifying webhook', { error: error.message });
    return sendError(res, error.message || 'Webhook verification failed', 400);
  }
});

/**
 * Verify payment status
 * @route   POST /api/v2/stripe/verify-payment-status
 * @access  Public
 */
const verifyPaymentStatusHandler = asyncHandler(async (req, res) => {
  try {
    const { clientSecret } = req.body;

    if (!clientSecret) {
      return sendError(res, 'Client secret is required', 400);
    }

    const result = await verifyPaymentStatus(clientSecret);
    return sendSuccess(res, result, 'Payment status verified successfully', 200);
  } catch (error) {
    console.error('Error verifying payment status', { error: error.message });
    return sendError(res, error.message || 'Failed to verify payment status', 500);
  }
});

/**
 * Get payment intent by ID (alternative endpoint)
 * @route   GET /api/v2/stripe/payment-intent-by-id/:id
 * @access  Public
 */
const getPaymentIntentByIdHandler = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, 'Payment intent ID is required', 400);
    }

    const result = await getPaymentIntentById(id);
    
    if (result.success) {
      return sendSuccess(res, result.paymentIntent, 'Payment intent retrieved successfully', 200);
    } else {
      return sendError(res, result.error || 'Failed to retrieve payment intent', 400);
    }
  } catch (error) {
    console.error('Error retrieving payment intent by ID', { error: error.message });
    return sendError(res, error.message || 'Failed to retrieve payment intent', 500);
  }
});

module.exports = {
  createPaymentIntentHandler,
  getPaymentIntentHandler,
  confirmPaymentIntentHandler,
  cancelPaymentIntentHandler,
  createCustomerHandler,
  createRefundHandler,
  webhookHandler,
  verifyPaymentStatusHandler,
  getPaymentIntentByIdHandler
};
