const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createDiscountsMapItem,
  getAllDiscountsMapItems,
  getDiscountsMapItemById,
  updateDiscountsMapItem,
  deleteDiscountsMapItem,
  getDiscountsMapItemsByAuth,
  getDiscountsMapItemsByItemId,
  getDiscountsMapItemsByBusinessBranchId
} = require('../../controllers/Discounts_Map_Item.controller');
const {
  createDiscountsMapItemSchema,
  updateDiscountsMapItemSchema,
  getDiscountsMapItemByIdSchema,
  getAllDiscountsMapItemsSchema,
  getDiscountsMapItemsByAuthSchema,
  getDiscountsMapItemsByItemIdParamsSchema,
  getDiscountsMapItemsByItemIdQuerySchema,
  getDiscountsMapItemsByBusinessBranchIdParamsSchema,
  getDiscountsMapItemsByBusinessBranchIdQuerySchema
} = require('../../../validators/Discounts_Map_Item.validator');

router.post('/create', auth, validateBody(createDiscountsMapItemSchema), createDiscountsMapItem);
router.get('/getAll', auth, validateQuery(getAllDiscountsMapItemsSchema), getAllDiscountsMapItems);
router.get('/getById/:id', auth, validateParams(getDiscountsMapItemByIdSchema), getDiscountsMapItemById);
router.put('/update/:id', auth, validateParams(getDiscountsMapItemByIdSchema), validateBody(updateDiscountsMapItemSchema), updateDiscountsMapItem);
router.delete('/delete/:id', auth, validateParams(getDiscountsMapItemByIdSchema), deleteDiscountsMapItem);
router.get('/getByAuth', auth, validateQuery(getDiscountsMapItemsByAuthSchema), getDiscountsMapItemsByAuth);
router.get('/getByItemId/:item_id', auth, validateParams(getDiscountsMapItemsByItemIdParamsSchema), validateQuery(getDiscountsMapItemsByItemIdQuerySchema), getDiscountsMapItemsByItemId);
router.get('/getByBusinessBranchId/:business_Branch_id', auth, validateParams(getDiscountsMapItemsByBusinessBranchIdParamsSchema), validateQuery(getDiscountsMapItemsByBusinessBranchIdQuerySchema), getDiscountsMapItemsByBusinessBranchId);

module.exports = router;

