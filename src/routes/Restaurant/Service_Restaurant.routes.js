const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createServiceRestaurant,
  getAllServiceRestaurants,
  getServiceRestaurantById,
  updateServiceRestaurant,
  deleteServiceRestaurant,
  getServiceRestaurantsByAuth,
  getServiceRestaurantsByBusinessBranchId
} = require('../../controllers/Service_Restaurant.controller');
const {
  createServiceRestaurantSchema,
  updateServiceRestaurantSchema,
  getServiceRestaurantByIdSchema,
  getAllServiceRestaurantsSchema,
  getServiceRestaurantsByAuthSchema,
  getServiceRestaurantsByBusinessBranchIdParamsSchema,
  getServiceRestaurantsByBusinessBranchIdQuerySchema
} = require('../../../validators/Service_Restaurant.validator');

router.post('/create', auth, validateBody(createServiceRestaurantSchema), createServiceRestaurant);
router.get('/getAll', validateQuery(getAllServiceRestaurantsSchema), getAllServiceRestaurants);
router.get('/getById/:id', auth, validateParams(getServiceRestaurantByIdSchema), getServiceRestaurantById);
router.put('/update/:id', auth, validateParams(getServiceRestaurantByIdSchema), validateBody(updateServiceRestaurantSchema), updateServiceRestaurant);
router.delete('/delete/:id', auth, validateParams(getServiceRestaurantByIdSchema), deleteServiceRestaurant);
router.get('/getByAuth', auth, validateQuery(getServiceRestaurantsByAuthSchema), getServiceRestaurantsByAuth);
router.get('/getByBusinessBranchId/:business_Branch_id', auth, validateParams(getServiceRestaurantsByBusinessBranchIdParamsSchema), validateQuery(getServiceRestaurantsByBusinessBranchIdQuerySchema), getServiceRestaurantsByBusinessBranchId);

module.exports = router;

