const express = require('express');
const router = express.Router();
const { auth } = require('../../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../../middleware/validation');
const {
  createCateringEventType,
  getAllCateringEventTypes,
  getCateringEventTypeById,
  updateCateringEventType,
  deleteCateringEventType,
  getCateringEventTypesByAuth
} = require('../../../../controllers/Catering_EventType.controller');
const {
  createCateringEventTypeSchema,
  updateCateringEventTypeSchema,
  getCateringEventTypeByIdSchema,
  getAllCateringEventTypesSchema,
  getCateringEventTypesByAuthSchema
} = require('../../../../../validators/Catering_EventType.validator');

router.post('/create', auth, validateBody(createCateringEventTypeSchema), createCateringEventType);

router.get('/getAll', validateQuery(getAllCateringEventTypesSchema), getAllCateringEventTypes);

router.get('/getById/:id', auth, validateParams(getCateringEventTypeByIdSchema), getCateringEventTypeById);

router.put('/update/:id', auth, validateParams(getCateringEventTypeByIdSchema), validateBody(updateCateringEventTypeSchema), updateCateringEventType);

router.delete('/delete/:id', auth, validateParams(getCateringEventTypeByIdSchema), deleteCateringEventType);

router.get('/getByAuth', auth, validateQuery(getCateringEventTypesByAuthSchema), getCateringEventTypesByAuth);

module.exports = router;

