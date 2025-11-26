const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createServiceChargesType,
  getAllServiceChargesTypes,
  getServiceChargesTypeById,
  updateServiceChargesType,
  deleteServiceChargesType,
  getServiceChargesTypesByAuth,
  getServiceChargesTypesByBusinessBranchId
} = require('../../controllers/ServiceCharges_type.controller');
const {
  createServiceChargesTypeSchema,
  updateServiceChargesTypeSchema,
  getServiceChargesTypeByIdSchema,
  getAllServiceChargesTypesSchema,
  getServiceChargesTypesByAuthSchema,
  getServiceChargesTypesByBusinessBranchIdParamsSchema,
  getServiceChargesTypesByBusinessBranchIdQuerySchema
} = require('../../../validators/ServiceCharges_type.validator');

router.post('/create', auth, validateBody(createServiceChargesTypeSchema), createServiceChargesType);
router.get('/getAll', validateQuery(getAllServiceChargesTypesSchema), getAllServiceChargesTypes);
router.get('/getById/:id', auth, validateParams(getServiceChargesTypeByIdSchema), getServiceChargesTypeById);
router.put('/update/:id', auth, validateParams(getServiceChargesTypeByIdSchema), validateBody(updateServiceChargesTypeSchema), updateServiceChargesType);
router.delete('/delete/:id', auth, validateParams(getServiceChargesTypeByIdSchema), deleteServiceChargesType);
router.get('/getByAuth', auth, validateQuery(getServiceChargesTypesByAuthSchema), getServiceChargesTypesByAuth);
router.get('/getByBusinessBranchId/:business_Branch_id', auth, validateParams(getServiceChargesTypesByBusinessBranchIdParamsSchema), validateQuery(getServiceChargesTypesByBusinessBranchIdQuerySchema), getServiceChargesTypesByBusinessBranchId);

module.exports = router;

