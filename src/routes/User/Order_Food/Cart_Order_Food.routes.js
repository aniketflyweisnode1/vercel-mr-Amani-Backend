const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');
const {
  createCartOrderFood,
  getAllCartOrderFoods,
  getCartOrderFoodById,
  updateCartOrderFood,
  deleteCartOrderFood,
  getCartOrderFoodsByAuth,
  getCartOrderFoodsByDate
} = require('../../../controllers/Cart_Order_Food.controller');
const {
  createCartOrderFoodSchema,
  updateCartOrderFoodSchema,
  getCartOrderFoodByIdSchema,
  getAllCartOrderFoodsSchema,
  getCartOrderFoodsByAuthSchema,
  getCartOrderFoodsByDateQuerySchema
} = require('../../../../validators/Cart_Order_Food.validator');

router.post('/create', auth, validateBody(createCartOrderFoodSchema), createCartOrderFood);
router.get('/getAll', validateQuery(getAllCartOrderFoodsSchema), getAllCartOrderFoods);
router.get('/getById/:id', auth, validateParams(getCartOrderFoodByIdSchema), getCartOrderFoodById);
router.put('/update/:id', auth, validateParams(getCartOrderFoodByIdSchema), validateBody(updateCartOrderFoodSchema), updateCartOrderFood);
router.delete('/delete/:id', auth, validateParams(getCartOrderFoodByIdSchema), deleteCartOrderFood);
router.get('/getByAuth', auth, validateQuery(getCartOrderFoodsByAuthSchema), getCartOrderFoodsByAuth);
router.get('/getByDate', validateQuery(getCartOrderFoodsByDateQuerySchema), getCartOrderFoodsByDate);

module.exports = router;

