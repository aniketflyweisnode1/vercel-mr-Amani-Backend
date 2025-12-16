const express = require('express');
const router = express.Router();
const { validateBody, validateParams } = require('../../../middleware/validation');
const {
  sendSMSHandler,
  sendWhatsAppHandler,
  makeCallHandler,
  getMessageStatusHandler,
  getCallStatusHandler,
  sendVerificationHandler,
  verifyCodeHandler
} = require('../../controllers/Twilio.controller');
const {
  sendSMSSchema,
  sendWhatsAppSchema,
  makeCallSchema,
  getMessageStatusSchema,
  getCallStatusSchema,
  sendVerificationSchema,
  verifyCodeSchema
} = require('../../../validators/Twilio.validator');


router.post('/send-sms', validateBody(sendSMSSchema), sendSMSHandler);
router.post('/send-whatsapp', validateBody(sendWhatsAppSchema), sendWhatsAppHandler);
router.post('/make-call', validateBody(makeCallSchema), makeCallHandler);
router.get('/message-status/:messageSid', validateParams(getMessageStatusSchema), getMessageStatusHandler);
router.get('/call-status/:callSid', validateParams(getCallStatusSchema), getCallStatusHandler);
router.post('/send-verification', validateBody(sendVerificationSchema), sendVerificationHandler);
router.post('/verify-code', validateBody(verifyCodeSchema), verifyCodeHandler);

module.exports = router;
