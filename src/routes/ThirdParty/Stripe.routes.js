const express = require('express');
const router = express.Router();
const { validateBody, validateParams } = require('../../../middleware/validation');
const {
  createPaymentIntentHandler,
  getPaymentIntentHandler,
  confirmPaymentIntentHandler,
  cancelPaymentIntentHandler,
  createCustomerHandler,
  createRefundHandler,
  webhookHandler,
  verifyPaymentStatusHandler,
  getPaymentIntentByIdHandler
} = require('../../controllers/Stripe.controller');
const {
  createPaymentIntentSchema,
  getPaymentIntentByIdSchema,
  confirmPaymentIntentSchema,
  cancelPaymentIntentSchema,
  createCustomerSchema,
  createRefundSchema,
  verifyPaymentStatusSchema,
  webhookSchema
} = require('../../../validators/Stripe.validator');

router.post('/create-payment-intent', validateBody(createPaymentIntentSchema), createPaymentIntentHandler);
router.get('/payment-intent/:id', validateParams(getPaymentIntentByIdSchema), getPaymentIntentHandler);
router.get('/payment-intent-by-id/:id', validateParams(getPaymentIntentByIdSchema), getPaymentIntentByIdHandler);
router.post('/confirm-payment-intent', validateBody(confirmPaymentIntentSchema), confirmPaymentIntentHandler);
router.post('/cancel-payment-intent', validateBody(cancelPaymentIntentSchema), cancelPaymentIntentHandler);
router.post('/create-customer', validateBody(createCustomerSchema), createCustomerHandler);
router.post('/create-refund', validateBody(createRefundSchema), createRefundHandler);
router.post('/webhook', validateBody(webhookSchema), webhookHandler);
router.post('/verify-payment-status', validateBody(verifyPaymentStatusSchema), verifyPaymentStatusHandler);

module.exports = router;
