const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createSupplierItem,
  getAllSupplierItems,
  getSupplierItemById,
  updateSupplierItem,
  deleteSupplierItem,
  getSupplierItemsByAuth,
  getSupplierItemsByCategory,
  getSupplierDashboard
} = require('../../controllers/Supplier_Items.controller');
const {
  createSupplierItemSchema,
  updateSupplierItemSchema,
  getSupplierItemByIdSchema,
  getAllSupplierItemsSchema,
  getSupplierItemsByAuthSchema,
  getSupplierItemsByCategoryParamsSchema,
  getSupplierItemsByCategoryQuerySchema
} = require('../../../validators/Supplier_Items.validator');

router.post('/create', auth, validateBody(createSupplierItemSchema), createSupplierItem);
router.get('/getAll', validateQuery(getAllSupplierItemsSchema), getAllSupplierItems);
router.get('/getById/:id', auth, validateParams(getSupplierItemByIdSchema), getSupplierItemById);
router.put('/update/:id', auth, validateParams(getSupplierItemByIdSchema), validateBody(updateSupplierItemSchema), updateSupplierItem);
router.delete('/delete/:id', auth, validateParams(getSupplierItemByIdSchema), deleteSupplierItem);
router.get('/getByAuth', auth, validateQuery(getSupplierItemsByAuthSchema), getSupplierItemsByAuth);
router.get('/getByRestaurantItemCategory/:Restaurant_item_Category_id', auth, validateQuery(getSupplierItemsByCategoryQuerySchema), validateParams(getSupplierItemsByCategoryParamsSchema), getSupplierItemsByCategory);
router.get('/dashboard', auth, getSupplierDashboard);

module.exports = router;

