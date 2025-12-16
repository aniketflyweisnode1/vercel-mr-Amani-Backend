const express = require('express');
const router = express.Router();
const { validateBody } = require('../../../middleware/validation');
const {
  sendTestNotificationHandler,
  sendNotificationHandler,
  sendMulticastNotificationHandler,
  sendTopicNotificationHandler,
  subscribeToTopicHandler,
  unsubscribeFromTopicHandler
} = require('../../controllers/Firebase.controller');
const {
  sendTestNotificationSchema,
  sendNotificationSchema,
  sendMulticastNotificationSchema,
  sendTopicNotificationSchema,
  subscribeToTopicSchema,
  unsubscribeFromTopicSchema
} = require('../../../validators/Firebase.validator');

router.post('/send-test', validateBody(sendTestNotificationSchema), sendTestNotificationHandler);
router.post('/send', validateBody(sendNotificationSchema), sendNotificationHandler);
router.post('/send-multicast', validateBody(sendMulticastNotificationSchema), sendMulticastNotificationHandler);
router.post('/send-topic', validateBody(sendTopicNotificationSchema), sendTopicNotificationHandler);
router.post('/subscribe-topic', validateBody(subscribeToTopicSchema), subscribeToTopicHandler);
router.post('/unsubscribe-topic', validateBody(unsubscribeFromTopicSchema), unsubscribeFromTopicHandler);

module.exports = router;
