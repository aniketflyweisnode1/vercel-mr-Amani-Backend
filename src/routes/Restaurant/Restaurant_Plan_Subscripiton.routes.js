const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createRestaurantPlanSubscription,
  getAllRestaurantPlanSubscriptions,
  getRestaurantPlanSubscriptionById,
  updateRestaurantPlanSubscription,
  deleteRestaurantPlanSubscription,
  getRestaurantPlanSubscriptionsByPlanId,
  getRestaurantPlanSubscriptionsByAuth
} = require('../../controllers/Restaurant_Plan_Subscripiton.controller');
const {
  createRestaurantPlanSubscriptionSchema,
  updateRestaurantPlanSubscriptionSchema,
  getRestaurantPlanSubscriptionByIdSchema,
  getAllRestaurantPlanSubscriptionsSchema,
  getRestaurantPlanSubscriptionsByAuthSchema,
  getRestaurantPlanSubscriptionsByPlanIdParamsSchema,
  getRestaurantPlanSubscriptionsByPlanIdQuerySchema
} = require('../../../validators/Restaurant_Plan_Subscripiton.validator');

router.post('/create', auth, validateBody(createRestaurantPlanSubscriptionSchema), createRestaurantPlanSubscription);
router.get('/getAll', validateQuery(getAllRestaurantPlanSubscriptionsSchema), getAllRestaurantPlanSubscriptions);
router.get('/getById/:id', auth, validateParams(getRestaurantPlanSubscriptionByIdSchema), getRestaurantPlanSubscriptionById);
router.put('/update/:id', auth, validateParams(getRestaurantPlanSubscriptionByIdSchema), validateBody(updateRestaurantPlanSubscriptionSchema), updateRestaurantPlanSubscription);
router.delete('/delete/:id', auth, validateParams(getRestaurantPlanSubscriptionByIdSchema), deleteRestaurantPlanSubscription);
router.get('/getByPlanId/:Restaurant_Plan_id', auth, validateParams(getRestaurantPlanSubscriptionsByPlanIdParamsSchema), validateQuery(getRestaurantPlanSubscriptionsByPlanIdQuerySchema), getRestaurantPlanSubscriptionsByPlanId);
router.get('/getByAuth', auth, validateQuery(getRestaurantPlanSubscriptionsByAuthSchema), getRestaurantPlanSubscriptionsByAuth);

module.exports = router;

