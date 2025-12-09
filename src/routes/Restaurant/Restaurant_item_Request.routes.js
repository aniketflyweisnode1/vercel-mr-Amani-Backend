const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createRestaurantItemRequest,
  getAllRestaurantItemRequests,
  getRestaurantItemRequestById,
  updateRestaurantItemRequest,
  deleteRestaurantItemRequest,
  getRestaurantItemRequestsBySupplier,
  getRestaurantItemRequestsByAuth
} = require('../../controllers/Restaurant_item_Request.controller');
const {
  createRestaurantItemRequestSchema,
  updateRestaurantItemRequestSchema,
  getRestaurantItemRequestByIdSchema,
  getAllRestaurantItemRequestsSchema,
  getRestaurantItemRequestsBySupplierParamsSchema,
  getRestaurantItemRequestsBySupplierQuerySchema,
  getRestaurantItemRequestsByAuthSchema
} = require('../../../validators/Restaurant_item_Request.validator');

router.post('/create', auth, validateBody(createRestaurantItemRequestSchema), createRestaurantItemRequest);
router.get('/getAll', validateQuery(getAllRestaurantItemRequestsSchema), getAllRestaurantItemRequests);
router.get('/getById/:id', auth, validateParams(getRestaurantItemRequestByIdSchema), getRestaurantItemRequestById);
router.put('/update/:id', auth, validateParams(getRestaurantItemRequestByIdSchema), validateBody(updateRestaurantItemRequestSchema), updateRestaurantItemRequest);
router.delete('/delete/:id', auth, validateParams(getRestaurantItemRequestByIdSchema), deleteRestaurantItemRequest);
router.get('/getBySupplier/:Supplier_id', auth, validateParams(getRestaurantItemRequestsBySupplierParamsSchema), validateQuery(getRestaurantItemRequestsBySupplierQuerySchema), getRestaurantItemRequestsBySupplier);
router.get('/getByAuth', auth, validateQuery(getRestaurantItemRequestsByAuthSchema), getRestaurantItemRequestsByAuth);

module.exports = router;
