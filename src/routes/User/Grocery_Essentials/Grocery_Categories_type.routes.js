const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');
const {
  createGroceryCategoriesType,
  getAllGroceryCategoriesTypes,
  getGroceryCategoriesTypeById,
  updateGroceryCategoriesType,
  deleteGroceryCategoriesType,
  getGroceryCategoriesTypesByTypeId,
  getGroceryCategoriesTypesByAuth
} = require('../../../controllers/Grocery_Categories_type.controller');
const {
  createGroceryCategoriesTypeSchema,
  updateGroceryCategoriesTypeSchema,
  getGroceryCategoriesTypeByIdSchema,
  getAllGroceryCategoriesTypeSchema,
  getGroceryCategoriesTypesByTypeIdParamsSchema,
  getGroceryCategoriesTypesByTypeIdQuerySchema,
  getGroceryCategoriesTypesByAuthSchema
} = require('../../../../validators/Grocery_Categories_type.validator');

router.post('/create', auth, validateBody(createGroceryCategoriesTypeSchema), createGroceryCategoriesType);
router.get('/getAll', validateQuery(getAllGroceryCategoriesTypeSchema), getAllGroceryCategoriesTypes);
router.get('/getById/:id', auth, validateParams(getGroceryCategoriesTypeByIdSchema), getGroceryCategoriesTypeById);
router.put('/update/:id', auth, validateParams(getGroceryCategoriesTypeByIdSchema), validateBody(updateGroceryCategoriesTypeSchema), updateGroceryCategoriesType);
router.delete('/delete/:id', auth, validateParams(getGroceryCategoriesTypeByIdSchema), deleteGroceryCategoriesType);
router.get('/getByTypeId/:Grocery_Categories_id', auth, validateParams(getGroceryCategoriesTypesByTypeIdParamsSchema), validateQuery(getGroceryCategoriesTypesByTypeIdQuerySchema), getGroceryCategoriesTypesByTypeId);
router.get('/getByAuth', auth, validateQuery(getGroceryCategoriesTypesByAuthSchema), getGroceryCategoriesTypesByAuth);

module.exports = router;

