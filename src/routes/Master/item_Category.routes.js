const express = require('express');
const router = express.Router();

const {
  createItemCategory,
  getAllItemCategories,
  getItemCategoryById,
  updateItemCategory,
  deleteItemCategory,
  getItemCategoriesByAuth,
  getItemCategoriesByTypeId
} = require('../../controllers/Item_Category.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const {
  createItemCategorySchema,
  updateItemCategorySchema,
  getItemCategoryByIdSchema,
  getAllItemCategoriesSchema,
  getItemCategoriesByAuthSchema,
  getItemCategoriesByTypeIdParamsSchema,
  getItemCategoriesByTypeIdQuerySchema
} = require('../../../validators/Item_Category.validator');

router.post('/create', auth, validateBody(createItemCategorySchema), createItemCategory);
router.get('/getAll', validateQuery(getAllItemCategoriesSchema), getAllItemCategories);
router.get('/getById/:id', auth, validateParams(getItemCategoryByIdSchema), getItemCategoryById);
router.put('/update/:id', auth, validateParams(getItemCategoryByIdSchema), validateBody(updateItemCategorySchema), updateItemCategory);
router.delete('/delete/:id', auth, validateParams(getItemCategoryByIdSchema), deleteItemCategory);
router.get('/getByAuth', auth, validateQuery(getItemCategoriesByAuthSchema), getItemCategoriesByAuth);
router.get('/getByTypeId/:item_type_id', auth, validateParams(getItemCategoriesByTypeIdParamsSchema), validateQuery(getItemCategoriesByTypeIdQuerySchema), getItemCategoriesByTypeId);

module.exports = router;
