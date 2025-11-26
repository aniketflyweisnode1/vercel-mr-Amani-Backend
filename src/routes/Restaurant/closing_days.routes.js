const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createClosingDays,
  getAllClosingDays,
  getClosingDaysById,
  updateClosingDays,
  deleteClosingDays,
  getClosingDaysByAuth,
  getClosingDaysByBranchId
} = require('../../controllers/closing_days.controller');
const {
  createClosingDaysSchema,
  updateClosingDaysSchema,
  getClosingDaysByIdSchema,
  getAllClosingDaysSchema,
  getClosingDaysByAuthSchema,
  getClosingDaysByBranchIdParamsSchema,
  getClosingDaysByBranchIdQuerySchema
} = require('../../../validators/closing_days.validator');

router.post('/create', auth, validateBody(createClosingDaysSchema), createClosingDays);

router.get('/getAll', validateQuery(getAllClosingDaysSchema), getAllClosingDays);

router.get('/getById/:id', auth, validateParams(getClosingDaysByIdSchema), getClosingDaysById);

router.put('/update/:id', auth, validateParams(getClosingDaysByIdSchema), validateBody(updateClosingDaysSchema), updateClosingDays);

router.delete('/delete/:id', auth, validateParams(getClosingDaysByIdSchema), deleteClosingDays);

router.get('/getByAuth', auth, validateQuery(getClosingDaysByAuthSchema), getClosingDaysByAuth);

router.get('/getByBranchId/:Branch_id', auth, validateParams(getClosingDaysByBranchIdParamsSchema), validateQuery(getClosingDaysByBranchIdQuerySchema), getClosingDaysByBranchId);


module.exports = router;

