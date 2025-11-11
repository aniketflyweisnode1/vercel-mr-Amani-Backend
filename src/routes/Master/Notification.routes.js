const express = require('express');
const router = express.Router();

const {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationsByAuth
} = require('../../controllers/Notification.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createNotificationSchema,
  updateNotificationSchema,
  getNotificationByIdSchema,
  getAllNotificationsSchema,
  getNotificationsByAuthSchema
} = require('../../../validators/Notification.validator');

router.post('/create', auth, validateBody(createNotificationSchema), createNotification);
router.get('/getAll', validateQuery(getAllNotificationsSchema), getAllNotifications);
router.get('/getById/:id', auth, validateParams(getNotificationByIdSchema), getNotificationById);
router.put('/update/:id', auth, validateParams(getNotificationByIdSchema), validateBody(updateNotificationSchema), updateNotification);
router.delete('/delete/:id', auth, validateParams(getNotificationByIdSchema), deleteNotification);
router.get('/getByAuth', auth, validateQuery(getNotificationsByAuthSchema), getNotificationsByAuth);

module.exports = router;
