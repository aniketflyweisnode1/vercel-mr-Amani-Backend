const express = require('express');
const router = express.Router();

const {
  createNotificationType,
  getAllNotificationTypes,
  getNotificationTypeById,
  updateNotificationType,
  deleteNotificationType
} = require('../../controllers/Notification_type.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createNotificationTypeSchema,
  updateNotificationTypeSchema,
  getNotificationTypeByIdSchema,
  getAllNotificationTypesSchema
} = require('../../../validators/Notification_type.validator');

router.post('/create', auth, validateBody(createNotificationTypeSchema), createNotificationType);
router.get('/getAll', validateQuery(getAllNotificationTypesSchema), getAllNotificationTypes);
router.get('/getById/:id', auth, validateParams(getNotificationTypeByIdSchema), getNotificationTypeById);
router.put('/update/:id', auth, validateParams(getNotificationTypeByIdSchema), validateBody(updateNotificationTypeSchema), updateNotificationType);
router.delete('/delete/:id', auth, validateParams(getNotificationTypeByIdSchema), deleteNotificationType);

module.exports = router;
