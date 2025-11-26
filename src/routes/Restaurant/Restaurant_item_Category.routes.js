const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createRestaurantItemCategory,
  getAllRestaurantItemCategories,
  getRestaurantItemCategoryById,
  updateRestaurantItemCategory,
  deleteRestaurantItemCategory,
  getRestaurantItemCategoriesByAuth,
  getRestaurantItemCategoryByTypeId
} = require('../../controllers/Restaurant_item_Category.controller');
const {
  createRestaurantItemCategorySchema,
  updateRestaurantItemCategorySchema,
  getRestaurantItemCategoryByIdSchema,
  getAllRestaurantItemCategoriesSchema,
  getRestaurantItemCategoriesByAuthSchema,
  getRestaurantItemCategoryByTypeIdParamsSchema
} = require('../../../validators/Restaurant_item_Category.validator');

router.post('/create', auth, validateBody(createRestaurantItemCategorySchema), createRestaurantItemCategory);
router.get('/getAll', validateQuery(getAllRestaurantItemCategoriesSchema), getAllRestaurantItemCategories);
router.get('/getById/:id', auth, validateParams(getRestaurantItemCategoryByIdSchema), getRestaurantItemCategoryById);
router.put('/update/:id', auth, validateParams(getRestaurantItemCategoryByIdSchema), validateBody(updateRestaurantItemCategorySchema), updateRestaurantItemCategory);
router.delete('/delete/:id', auth, validateParams(getRestaurantItemCategoryByIdSchema), deleteRestaurantItemCategory);
router.get('/getByAuth', auth, validateQuery(getRestaurantItemCategoriesByAuthSchema), getRestaurantItemCategoriesByAuth);
router.get('/getByTypeId/:Restaurant_item_Category_id', auth, validateParams(getRestaurantItemCategoryByTypeIdParamsSchema), getRestaurantItemCategoryByTypeId);

module.exports = router;


