const express = require('express');
const router = express.Router();

const { createBusinessType, getAllBusinessTypes, getBusinessTypeById, updateBusinessType, deleteBusinessType, getBusinessTypesByAuth } = require('../../controllers/businessType.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createBusinessTypeSchema, updateBusinessTypeSchema, getBusinessTypeByIdSchema, getAllBusinessTypesSchema, getBusinessTypesByAuthSchema } = require('../../../validators/businessType.validator');

router.post('/create', auth, validateBody(createBusinessTypeSchema), createBusinessType);
router.get('/getAll', validateQuery(getAllBusinessTypesSchema), getAllBusinessTypes);
router.get('/getById/:id', auth, validateParams(getBusinessTypeByIdSchema), getBusinessTypeById);
router.put('/update/:id', auth, validateParams(getBusinessTypeByIdSchema), validateBody(updateBusinessTypeSchema), updateBusinessType);
router.delete('/delete/:id', auth, validateParams(getBusinessTypeByIdSchema), deleteBusinessType);
router.get('/getByAuth', auth, validateQuery(getBusinessTypesByAuthSchema), getBusinessTypesByAuth);

module.exports = router;

