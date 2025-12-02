const express = require('express');
const router = express.Router();
const { auth } = require('../../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../../middleware/validation');
const {
  createCateringEvent,
  getAllCateringEvents,
  getCateringEventById,
  updateCateringEvent,
  deleteCateringEvent,
  getCateringEventsByTypeId,
  getCateringEventsByAuth
} = require('../../../../controllers/Catering_Event.controller');
const {
  createCateringEventSchema,
  updateCateringEventSchema,
  getCateringEventByIdSchema,
  getAllCateringEventsSchema,
  getCateringEventsByTypeIdParamsSchema,
  getCateringEventsByTypeIdQuerySchema,
  getCateringEventsByAuthSchema
} = require('../../../../../validators/Catering_Event.validator');

router.post('/create', auth, validateBody(createCateringEventSchema), createCateringEvent);

router.get('/getAll', validateQuery(getAllCateringEventsSchema), getAllCateringEvents);

router.get('/getById/:id', auth, validateParams(getCateringEventByIdSchema), getCateringEventById);

router.put('/update/:id', auth, validateParams(getCateringEventByIdSchema), validateBody(updateCateringEventSchema), updateCateringEvent);

router.delete('/delete/:id', auth, validateParams(getCateringEventByIdSchema), deleteCateringEvent);

router.get('/getByTypeId/:Catering_Eventtype_id', auth, validateParams(getCateringEventsByTypeIdParamsSchema), validateQuery(getCateringEventsByTypeIdQuerySchema), getCateringEventsByTypeId);

router.get('/getByAuth', auth, validateQuery(getCateringEventsByAuthSchema), getCateringEventsByAuth);

module.exports = router;

