const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createWorkingHours,
  getAllWorkingHours,
  getWorkingHoursById,
  updateWorkingHours,
  deleteWorkingHours,
  getWorkingHoursByAuth,
  getWorkingHoursByBranchId
} = require('../../controllers/Working_Hours.controller');
const {
  createWorkingHoursSchema,
  updateWorkingHoursSchema,
  getWorkingHoursByIdSchema,
  getAllWorkingHoursSchema,
  getWorkingHoursByAuthSchema,
  getWorkingHoursByBranchIdParamsSchema,
  getWorkingHoursByBranchIdQuerySchema
} = require('../../../validators/Working_Hours.validator');

router.post('/create', auth, validateBody(createWorkingHoursSchema), createWorkingHours);

router.get('/getAll', validateQuery(getAllWorkingHoursSchema), getAllWorkingHours);

router.get('/getById/:id', auth, validateParams(getWorkingHoursByIdSchema), getWorkingHoursById);

router.put('/update/:id', auth, validateParams(getWorkingHoursByIdSchema), validateBody(updateWorkingHoursSchema), updateWorkingHours);

router.delete('/delete/:id', auth, validateParams(getWorkingHoursByIdSchema), deleteWorkingHours);

router.get('/getByAuth', auth, validateQuery(getWorkingHoursByAuthSchema), getWorkingHoursByAuth);

router.get('/getByBranchId/:Branch_id', auth, validateParams(getWorkingHoursByBranchIdParamsSchema), validateQuery(getWorkingHoursByBranchIdQuerySchema), getWorkingHoursByBranchId);

module.exports = router;

