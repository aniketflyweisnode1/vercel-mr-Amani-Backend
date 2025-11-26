const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createScheduleMyAvailability,
  getAllScheduleMyAvailability,
  getScheduleMyAvailabilityById,
  updateScheduleMyAvailability,
  deleteScheduleMyAvailability,
  getScheduleMyAvailabilityByAuth,
  getScheduleMyAvailabilityByTypeId
} = require('../../controllers/WorkForceManagement_Schedule_Myavailability.controller');
const {
  createScheduleMyAvailabilitySchema,
  updateScheduleMyAvailabilitySchema,
  getScheduleMyAvailabilityByIdSchema,
  getAllScheduleMyAvailabilitySchema,
  getScheduleMyAvailabilityByAuthSchema,
  getScheduleMyAvailabilityByTypeParamsSchema,
  getScheduleMyAvailabilityByTypeQuerySchema
} = require('../../../validators/WorkForceManagement_Schedule_Myavailability.validator');

router.post('/create', auth, validateBody(createScheduleMyAvailabilitySchema), createScheduleMyAvailability);
router.get('/getAll', validateQuery(getAllScheduleMyAvailabilitySchema), getAllScheduleMyAvailability);
router.get('/getById/:id', auth, validateParams(getScheduleMyAvailabilityByIdSchema), getScheduleMyAvailabilityById);
router.put('/update/:id', auth, validateParams(getScheduleMyAvailabilityByIdSchema), validateBody(updateScheduleMyAvailabilitySchema), updateScheduleMyAvailability);
router.delete('/delete/:id', auth, validateParams(getScheduleMyAvailabilityByIdSchema), deleteScheduleMyAvailability);
router.get('/getByAuth', auth, validateQuery(getScheduleMyAvailabilityByAuthSchema), getScheduleMyAvailabilityByAuth);
router.get('/getByTypeId/:type', auth, validateParams(getScheduleMyAvailabilityByTypeParamsSchema), validateQuery(getScheduleMyAvailabilityByTypeQuerySchema), getScheduleMyAvailabilityByTypeId);

module.exports = router;



