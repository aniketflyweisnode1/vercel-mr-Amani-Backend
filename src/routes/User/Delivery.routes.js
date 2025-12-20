const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
  getDeliveriesByOrderId,
  getDeliveriesByItem,
  getDeliveriesByAuth
} = require('../../controllers/Delivery.controller');
const {
  createDeliverySchema,
  updateDeliverySchema,
  getDeliveryByIdSchema,
  getAllDeliveriesSchema,
  getDeliveriesByOrderIdParamsSchema,
  getDeliveriesByOrderIdQuerySchema,
  getDeliveriesByItemParamsSchema,
  getDeliveriesByItemQuerySchema,
  getDeliveriesByAuthSchema
} = require('../../../validators/Delivery.validator');

router.post('/create', auth, validateBody(createDeliverySchema), createDelivery);
router.get('/getAll', validateQuery(getAllDeliveriesSchema), getAllDeliveries);
router.get('/getById/:id', auth, validateParams(getDeliveryByIdSchema), getDeliveryById);
router.put('/update/:id', auth, validateParams(getDeliveryByIdSchema), validateBody(updateDeliverySchema), updateDelivery);
router.delete('/delete/:id', auth, validateParams(getDeliveryByIdSchema), deleteDelivery);
router.get('/getByAuth', auth, validateQuery(getDeliveriesByAuthSchema), getDeliveriesByAuth);
router.get('/getByOrderId/:order_id', auth, validateParams(getDeliveriesByOrderIdParamsSchema), validateQuery(getDeliveriesByOrderIdQuerySchema), getDeliveriesByOrderId);
router.get('/getByItem/:item_id', auth, validateParams(getDeliveriesByItemParamsSchema), validateQuery(getDeliveriesByItemQuerySchema), getDeliveriesByItem);

module.exports = router;

