const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  getDiscountsByTypeId,
  getDiscountsByAuth,
  getDiscountsByBusinessBranchId
} = require('../../controllers/Discounts.controller');
const {
  createDiscountsSchema,
  updateDiscountsSchema,
  getDiscountsByIdSchema,
  getAllDiscountsSchema,
  getDiscountsByAuthSchema,
  getDiscountsByTypeIdParamsSchema,
  getDiscountsByTypeIdQuerySchema,
  getDiscountsByBusinessBranchIdParamsSchema,
  getDiscountsByBusinessBranchIdQuerySchema
} = require('../../../validators/Discounts.validator');

router.post('/create', auth, validateBody(createDiscountsSchema), createDiscount);
router.get('/getAll', validateQuery(getAllDiscountsSchema), getAllDiscounts);
router.get('/getById/:id', auth, validateParams(getDiscountsByIdSchema), getDiscountById);
router.put('/update/:id', auth, validateParams(getDiscountsByIdSchema), validateBody(updateDiscountsSchema), updateDiscount);
router.delete('/delete/:id', auth, validateParams(getDiscountsByIdSchema), deleteDiscount);
router.get('/getByTypeId/:Discounts_type_id', auth, validateParams(getDiscountsByTypeIdParamsSchema), validateQuery(getDiscountsByTypeIdQuerySchema), getDiscountsByTypeId);
router.get('/getByAuth', auth, validateQuery(getDiscountsByAuthSchema), getDiscountsByAuth);
router.get('/getByBusinessBranchId/:business_Branch_id', auth, validateParams(getDiscountsByBusinessBranchIdParamsSchema), validateQuery(getDiscountsByBusinessBranchIdQuerySchema), getDiscountsByBusinessBranchId);

module.exports = router;

