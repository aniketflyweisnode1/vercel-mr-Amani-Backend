const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createRestaurantItem,
  getAllRestaurantItems,
  getRestaurantItemById,
  updateRestaurantItem,
  deleteRestaurantItem,
  getRestaurantItemsByAuth,
  getRestaurantItemsByCategory,
  getRestaurantItemDashboard,
  getRestaurantItemDashboardBySupplier
} = require('../../controllers/Restaurant_Items.controller');
const {
  createRestaurantItemSchema,
  updateRestaurantItemSchema,
  getRestaurantItemByIdSchema,
  getAllRestaurantItemsSchema,
  getRestaurantItemsByAuthSchema,
  getRestaurantItemsByCategoryParamsSchema,
  getRestaurantItemsByCategoryQuerySchema,
  getDashboardBySupplierSchema
} = require('../../../validators/Restaurant_Items.validator');

router.post('/create', auth, validateBody(createRestaurantItemSchema), createRestaurantItem);
router.get('/getAll', validateQuery(getAllRestaurantItemsSchema), getAllRestaurantItems);
router.get('/getById/:id', auth, validateParams(getRestaurantItemByIdSchema), getRestaurantItemById);
router.put('/update/:id', auth, validateParams(getRestaurantItemByIdSchema), validateBody(updateRestaurantItemSchema), updateRestaurantItem);
router.delete('/delete/:id', auth, validateParams(getRestaurantItemByIdSchema), deleteRestaurantItem);
router.get('/getByAuth', auth, validateQuery(getRestaurantItemsByAuthSchema), getRestaurantItemsByAuth);
router.get('/getByRestaurantItemCategory/:Restaurant_item_Category_id', auth, validateQuery(getRestaurantItemsByCategoryQuerySchema), validateParams(getRestaurantItemsByCategoryParamsSchema), getRestaurantItemsByCategory);
router.get('/dashboard', auth, getRestaurantItemDashboard);
router.get('/dashboard/SupplierName', auth, validateQuery(getDashboardBySupplierSchema), getRestaurantItemDashboardBySupplier);

module.exports = router;


