const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');
const {
  createGroceryCategories,
  getAllGroceryCategories,
  getGroceryCategoriesById,
  updateGroceryCategories,
  deleteGroceryCategories,
  getGroceryCategoriesByAuth
} = require('../../../controllers/Grocery_Categories.controller');
const {
  createGroceryCategoriesSchema,
  updateGroceryCategoriesSchema,
  getGroceryCategoriesByIdSchema,
  getAllGroceryCategoriesSchema,
  getGroceryCategoriesByAuthSchema
} = require('../../../../validators/Grocery_Categories.validator');

router.post('/create', auth, validateBody(createGroceryCategoriesSchema), createGroceryCategories);
router.get('/getAll', validateQuery(getAllGroceryCategoriesSchema), getAllGroceryCategories);
router.get('/getById/:id', auth, validateParams(getGroceryCategoriesByIdSchema), getGroceryCategoriesById);
router.put('/update/:id', auth, validateParams(getGroceryCategoriesByIdSchema), validateBody(updateGroceryCategoriesSchema), updateGroceryCategories);
router.delete('/delete/:id', auth, validateParams(getGroceryCategoriesByIdSchema), deleteGroceryCategories);
router.get('/getByAuth', auth, validateQuery(getGroceryCategoriesByAuthSchema), getGroceryCategoriesByAuth);

module.exports = router;

