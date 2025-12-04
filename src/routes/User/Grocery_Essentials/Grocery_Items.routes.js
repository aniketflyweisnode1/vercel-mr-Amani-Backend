const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');
const {
  createGroceryItem,
  getAllGroceryItems,
  getGroceryItemById,
  updateGroceryItem,
  deleteGroceryItem,
  getGroceryItemsByAuth,
  getGroceryItemsByTypeId,
  getGroceryItemsByCategory
} = require('../../../controllers/Grocery_Items.controller');
const {
  createGroceryItemSchema,
  updateGroceryItemSchema,
  getGroceryItemByIdSchema,
  getAllGroceryItemsSchema,
  getGroceryItemsByAuthSchema,
  getGroceryItemsByTypeIdParamsSchema,
  getGroceryItemsByTypeIdQuerySchema,
  getGroceryItemsByCategoryParamsSchema,
  getGroceryItemsByCategoryQuerySchema
} = require('../../../../validators/Grocery_Items.validator');

router.post('/create', auth, validateBody(createGroceryItemSchema), createGroceryItem);
router.get('/getAll', validateQuery(getAllGroceryItemsSchema), getAllGroceryItems);
router.get('/getById/:id', auth, validateParams(getGroceryItemByIdSchema), getGroceryItemById);
router.put('/update/:id', auth, validateParams(getGroceryItemByIdSchema), validateBody(updateGroceryItemSchema), updateGroceryItem);
router.delete('/delete/:id', auth, validateParams(getGroceryItemByIdSchema), deleteGroceryItem);
router.get('/getByAuth', auth, validateQuery(getGroceryItemsByAuthSchema), getGroceryItemsByAuth);
router.get('/getByTypeId/:Grocery_Categories_type_id', auth, validateParams(getGroceryItemsByTypeIdParamsSchema), validateQuery(getGroceryItemsByTypeIdQuerySchema), getGroceryItemsByTypeId);
router.get('/getByCategory/:Grocery_Categories_id', auth, validateParams(getGroceryItemsByCategoryParamsSchema), validateQuery(getGroceryItemsByCategoryQuerySchema), getGroceryItemsByCategory);

module.exports = router;

