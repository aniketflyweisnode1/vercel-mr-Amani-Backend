const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createRestaurantPlan,
  getAllRestaurantPlans,
  getRestaurantPlanById,
  updateRestaurantPlan,
  deleteRestaurantPlan,
  getRestaurantPlansByAuth
} = require('../../controllers/Restaurant_Plan.controller');
const {
  createRestaurantPlanSchema,
  updateRestaurantPlanSchema,
  getRestaurantPlanByIdSchema,
  getAllRestaurantPlansSchema,
  getRestaurantPlansByAuthSchema
} = require('../../../validators/Restaurant_Plan.validator');

router.post('/create', auth, validateBody(createRestaurantPlanSchema), createRestaurantPlan);
router.get('/getAll', validateQuery(getAllRestaurantPlansSchema), getAllRestaurantPlans);
router.get('/getById/:id', auth, validateParams(getRestaurantPlanByIdSchema), getRestaurantPlanById);
router.put('/update/:id', auth, validateParams(getRestaurantPlanByIdSchema), validateBody(updateRestaurantPlanSchema), updateRestaurantPlan);
router.delete('/delete/:id', auth, validateParams(getRestaurantPlanByIdSchema), deleteRestaurantPlan);
router.get('/getByAuth', auth, validateQuery(getRestaurantPlansByAuthSchema), getRestaurantPlansByAuth);

module.exports = router;

