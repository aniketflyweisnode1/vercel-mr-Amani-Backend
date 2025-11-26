const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createDiscountsType,
  getAllDiscountsTypes,
  getDiscountsTypeById,
  updateDiscountsType,
  deleteDiscountsType,
  getDiscountsTypesByAuth,
  getDiscountsTypesByBusinessBranchId
} = require('../../controllers/Discounts_type.controller');
const {
  createDiscountsTypeSchema,
  updateDiscountsTypeSchema,
  getDiscountsTypeByIdSchema,
  getAllDiscountsTypesSchema,
  getDiscountsTypesByAuthSchema,
  getDiscountsTypesByBusinessBranchIdParamsSchema,
  getDiscountsTypesByBusinessBranchIdQuerySchema
} = require('../../../validators/Discounts_type.validator');

router.post('/create', auth, validateBody(createDiscountsTypeSchema), createDiscountsType);
router.get('/getAll', validateQuery(getAllDiscountsTypesSchema), getAllDiscountsTypes);
router.get('/getById/:id', auth, validateParams(getDiscountsTypeByIdSchema), getDiscountsTypeById);
router.put('/update/:id', auth, validateParams(getDiscountsTypeByIdSchema), validateBody(updateDiscountsTypeSchema), updateDiscountsType);
router.delete('/delete/:id', auth, validateParams(getDiscountsTypeByIdSchema), deleteDiscountsType);
router.get('/getByAuth', auth, validateQuery(getDiscountsTypesByAuthSchema), getDiscountsTypesByAuth);
router.get('/getByBusinessBranchId/:business_Branch_id', auth, validateParams(getDiscountsTypesByBusinessBranchIdParamsSchema), validateQuery(getDiscountsTypesByBusinessBranchIdQuerySchema), getDiscountsTypesByBusinessBranchId);

module.exports = router;

