const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');
const {
  createOrderNow,
  getAllOrderNows,
  getOrderNowById,
  updateOrderNow,
  deleteOrderNow,
  getOrderNowsByAuth,
  getOrderNowsByDate
} = require('../../../controllers/Order_Now.controller');
const {
  createOrderNowSchema,
  updateOrderNowSchema,
  getOrderNowByIdSchema,
  getAllOrderNowsSchema,
  getOrderNowsByAuthSchema,
  getOrderNowsByDateQuerySchema
} = require('../../../../validators/Order_Now.validator');

router.post('/create', auth, validateBody(createOrderNowSchema), createOrderNow);
router.get('/getAll', validateQuery(getAllOrderNowsSchema), getAllOrderNows);
router.get('/getById/:id', auth, validateParams(getOrderNowByIdSchema), getOrderNowById);
router.put('/update/:id', auth, validateParams(getOrderNowByIdSchema), validateBody(updateOrderNowSchema), updateOrderNow);
router.delete('/delete/:id', auth, validateParams(getOrderNowByIdSchema), deleteOrderNow);
router.get('/getByAuth', auth, validateQuery(getOrderNowsByAuthSchema), getOrderNowsByAuth);
router.get('/getByDate', validateQuery(getOrderNowsByDateQuerySchema), getOrderNowsByDate);

module.exports = router;

