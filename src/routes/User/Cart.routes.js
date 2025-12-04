const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createCart,
  getAllCarts,
  getCartById,
  updateCart,
  deleteCart,
  getCartsByAuth,
  getCartsByDate
} = require('../../controllers/Cart.controller');
const {
  createCartSchema,
  updateCartSchema,
  getCartByIdSchema,
  getAllCartsSchema,
  getCartsByAuthSchema,
  getCartsByDateQuerySchema
} = require('../../../validators/Cart.validator');

router.post('/create', auth, validateBody(createCartSchema), createCart);
router.get('/getAll', validateQuery(getAllCartsSchema), getAllCarts);
router.get('/getById/:id', auth, validateParams(getCartByIdSchema), getCartById);
router.put('/update/:id', auth, validateParams(getCartByIdSchema), validateBody(updateCartSchema), updateCart);
router.delete('/delete/:id', auth, validateParams(getCartByIdSchema), deleteCart);
router.get('/getByAuth', auth, validateQuery(getCartsByAuthSchema), getCartsByAuth);
router.get('/getByDate', validateQuery(getCartsByDateQuerySchema), getCartsByDate);

module.exports = router;

