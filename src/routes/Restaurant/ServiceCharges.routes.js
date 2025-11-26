const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createServiceCharges,
  getAllServiceCharges,
  getServiceChargesById,
  updateServiceCharges,
  deleteServiceCharges,
  getServiceChargesByAuth,
  getServiceChargesByTypeId,
  getServiceChargesByServiceRestaurantId,
  getServiceChargesByBusinessBranchId
} = require('../../controllers/ServiceCharges.controller');
const {
  createServiceChargesSchema,
  updateServiceChargesSchema,
  getServiceChargesByIdSchema,
  getAllServiceChargesSchema,
  getServiceChargesByAuthSchema,
  getServiceChargesByTypeIdParamsSchema,
  getServiceChargesByTypeIdQuerySchema,
  getServiceChargesByServiceRestaurantIdParamsSchema,
  getServiceChargesByServiceRestaurantIdQuerySchema,
  getServiceChargesByBusinessBranchIdParamsSchema,
  getServiceChargesByBusinessBranchIdQuerySchema
} = require('../../../validators/ServiceCharges.validator');

router.post('/create', auth, validateBody(createServiceChargesSchema), createServiceCharges);
router.get('/getAll', validateQuery(getAllServiceChargesSchema), getAllServiceCharges);
router.get('/getById/:id', auth, validateParams(getServiceChargesByIdSchema), getServiceChargesById);
router.put('/update/:id', auth, validateParams(getServiceChargesByIdSchema), validateBody(updateServiceChargesSchema), updateServiceCharges);
router.delete('/delete/:id', auth, validateParams(getServiceChargesByIdSchema), deleteServiceCharges);
router.get('/getByAuth', auth, validateQuery(getServiceChargesByAuthSchema), getServiceChargesByAuth);
router.get('/getByTypeId/:ServiceCharges_type_id', auth, validateParams(getServiceChargesByTypeIdParamsSchema), validateQuery(getServiceChargesByTypeIdQuerySchema), getServiceChargesByTypeId);
router.get('/getByServiceRestaurantId/:Service_Restaurant_id', auth, validateParams(getServiceChargesByServiceRestaurantIdParamsSchema), validateQuery(getServiceChargesByServiceRestaurantIdQuerySchema), getServiceChargesByServiceRestaurantId);
router.get('/getByBusinessBranchId/:business_Branch_id', auth, validateParams(getServiceChargesByBusinessBranchIdParamsSchema), validateQuery(getServiceChargesByBusinessBranchIdQuerySchema), getServiceChargesByBusinessBranchId);

module.exports = router;

