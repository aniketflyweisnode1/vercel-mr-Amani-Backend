const express = require('express');
const router = express.Router();
const { auth } = require('../../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../../middleware/validation');
const {
  createScheduleMeeting,
  getAllScheduleMeetings,
  getScheduleMeetingById,
  updateScheduleMeeting,
  deleteScheduleMeeting,
  getScheduleMeetingsSubscriberGroupByPlanName
} = require('../../../../controllers/Schedule_Meeting.controller');
const {
  createScheduleMeetingSchema,
  updateScheduleMeetingSchema,
  getScheduleMeetingByIdSchema,
  getAllScheduleMeetingsSchema,
  getScheduleMeetingsSubscriberGroupByPlanNameSchema
} = require('../../../../../validators/Schedule_Meeting.validator');

router.post('/create', auth, validateBody(createScheduleMeetingSchema), createScheduleMeeting);
router.get('/getAll', validateQuery(getAllScheduleMeetingsSchema), getAllScheduleMeetings);
router.get('/getById/:id', auth, validateParams(getScheduleMeetingByIdSchema), getScheduleMeetingById);
router.put('/update/:id', auth, validateParams(getScheduleMeetingByIdSchema), validateBody(updateScheduleMeetingSchema), updateScheduleMeeting);
router.delete('/delete/:id', auth, validateParams(getScheduleMeetingByIdSchema), deleteScheduleMeeting);
router.get('/Subscribergroupbyplanname', auth, validateQuery(getScheduleMeetingsSubscriberGroupByPlanNameSchema), getScheduleMeetingsSubscriberGroupByPlanName);

module.exports = router;

