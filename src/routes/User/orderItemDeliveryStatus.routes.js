const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createOrderItemDeliveryStatus,
  getAllOrderItemDeliveryStatus,
  getOrderItemDeliveryStatusById,
  updateOrderItemDeliveryStatus,
  deleteOrderItemDeliveryStatus,
  getOrderItemDeliveryStatusByOrderId,
  getOrderItemDeliveryStatusByItemId,
  getOrderItemDeliveryStatusByDeliveryStatus,
  getOrderItemDeliveryStatusByAuth
} = require('../../controllers/orderItemDeliveryStatus.controller');
const {
  createOrderItemDeliveryStatusSchema,
  updateOrderItemDeliveryStatusSchema,
  getOrderItemDeliveryStatusByIdSchema,
  getAllOrderItemDeliveryStatusSchema,
  getOrderItemDeliveryStatusByOrderIdParamsSchema,
  getOrderItemDeliveryStatusByOrderIdQuerySchema,
  getOrderItemDeliveryStatusByItemIdParamsSchema,
  getOrderItemDeliveryStatusByItemIdQuerySchema,
  getOrderItemDeliveryStatusByDeliveryStatusParamsSchema,
  getOrderItemDeliveryStatusByDeliveryStatusQuerySchema,
  getOrderItemDeliveryStatusByAuthSchema
} = require('../../../validators/orderItemDeliveryStatus.validator');

router.post('/create', auth, validateBody(createOrderItemDeliveryStatusSchema), createOrderItemDeliveryStatus);
router.get('/getAll', validateQuery(getAllOrderItemDeliveryStatusSchema), getAllOrderItemDeliveryStatus);
router.get('/getById/:id', auth, validateParams(getOrderItemDeliveryStatusByIdSchema), getOrderItemDeliveryStatusById);
router.put('/update/:id', auth, validateParams(getOrderItemDeliveryStatusByIdSchema), validateBody(updateOrderItemDeliveryStatusSchema), updateOrderItemDeliveryStatus);
router.delete('/delete/:id', auth, validateParams(getOrderItemDeliveryStatusByIdSchema), deleteOrderItemDeliveryStatus);
router.get('/getByOrderId/:order_id', auth, validateParams(getOrderItemDeliveryStatusByOrderIdParamsSchema), validateQuery(getOrderItemDeliveryStatusByOrderIdQuerySchema), getOrderItemDeliveryStatusByOrderId);
router.get('/getByItemId/:Item_id', auth, validateParams(getOrderItemDeliveryStatusByItemIdParamsSchema), validateQuery(getOrderItemDeliveryStatusByItemIdQuerySchema), getOrderItemDeliveryStatusByItemId);
router.get('/getByDeliveryStatus/:DeliveryStatus', auth, validateParams(getOrderItemDeliveryStatusByDeliveryStatusParamsSchema), validateQuery(getOrderItemDeliveryStatusByDeliveryStatusQuerySchema), getOrderItemDeliveryStatusByDeliveryStatus);
router.get('/getByAuth', auth, validateQuery(getOrderItemDeliveryStatusByAuthSchema), getOrderItemDeliveryStatusByAuth);

module.exports = router;

