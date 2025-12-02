const express = require('express');
const router = express.Router();
const { auth } = require('../../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../../middleware/validation');
const {
  createCateringType,
  getAllCateringTypes,
  getCateringTypeById,
  updateCateringType,
  deleteCateringType,
  getCateringTypesByAuth
} = require('../../../../controllers/Catering_Type.controller');
const {
  createCateringTypeSchema,
  updateCateringTypeSchema,
  getCateringTypeByIdSchema,
  getAllCateringTypesSchema,
  getCateringTypesByAuthSchema
} = require('../../../../../validators/Catering_Type.validator');

router.post('/create', auth, validateBody(createCateringTypeSchema), createCateringType);

router.get('/getAll', validateQuery(getAllCateringTypesSchema), getAllCateringTypes);

router.get('/getById/:id', auth, validateParams(getCateringTypeByIdSchema), getCateringTypeById);

router.put('/update/:id', auth, validateParams(getCateringTypeByIdSchema), validateBody(updateCateringTypeSchema), updateCateringType);

router.delete('/delete/:id', auth, validateParams(getCateringTypeByIdSchema), deleteCateringType);

router.get('/getByAuth', auth, validateQuery(getCateringTypesByAuthSchema), getCateringTypesByAuth);

module.exports = router;

