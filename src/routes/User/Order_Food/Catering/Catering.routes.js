const express = require('express');
const router = express.Router();
const { auth } = require('../../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../../middleware/validation');
const {
  createCatering,
  getAllCaterings,
  getCateringById,
  updateCatering,
  deleteCatering,
  getCateringsByTypeId,
  getCateringsByAuth
} = require('../../../../controllers/Catering.controller');
const {
  createCateringSchema,
  updateCateringSchema,
  getCateringByIdSchema,
  getAllCateringsSchema,
  getCateringsByTypeIdParamsSchema,
  getCateringsByTypeIdQuerySchema,
  getCateringsByAuthSchema
} = require('../../../../../validators/Catering.validator');

router.post('/create', auth, validateBody(createCateringSchema), createCatering);

router.get('/getAll', validateQuery(getAllCateringsSchema), getAllCaterings);

router.get('/getById/:id', auth, validateParams(getCateringByIdSchema), getCateringById);

router.put('/update/:id', auth, validateParams(getCateringByIdSchema), validateBody(updateCateringSchema), updateCatering);

router.delete('/delete/:id', auth, validateParams(getCateringByIdSchema), deleteCatering);

router.get('/getByTypeId/:Catering_type_id', auth, validateParams(getCateringsByTypeIdParamsSchema), validateQuery(getCateringsByTypeIdQuerySchema), getCateringsByTypeId);

router.get('/getByAuth', auth, validateQuery(getCateringsByAuthSchema), getCateringsByAuth);

module.exports = router;

