const express = require('express');
const router = express.Router();
const { validateBody } = require('../../../middleware/validation');
const {
  sendEmailHandler,
  sendTestEmailHandler,
  sendOTPEmailHandler,
  sendWelcomeEmailHandler,
  sendPasswordResetEmailHandler
} = require('../../controllers/Email.controller');
const {
  sendEmailSchema,
  sendTestEmailSchema,
  sendOTPEmailSchema,
  sendWelcomeEmailSchema,
  sendPasswordResetEmailSchema
} = require('../../../validators/Email.validator');


router.post('/send', validateBody(sendEmailSchema), sendEmailHandler);
router.post('/send-test', validateBody(sendTestEmailSchema), sendTestEmailHandler);
router.post('/send-otp', validateBody(sendOTPEmailSchema), sendOTPEmailHandler);
router.post('/send-welcome', validateBody(sendWelcomeEmailSchema), sendWelcomeEmailHandler);
router.post('/send-password-reset', validateBody(sendPasswordResetEmailSchema), sendPasswordResetEmailHandler);

module.exports = router;
