const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createAdminPlanSubscription,
  getAllAdminPlanSubscriptions,
  getAdminPlanSubscriptionById,
  updateAdminPlanSubscription,
  deleteAdminPlanSubscription,
  getAdminPlanSubscriptionsByPlanId,
  getAdminPlanSubscriptionsByAuth
} = require('../../controllers/Admin_Plan_Subscripiton.controller');
const {
  createAdminPlanSubscriptionSchema,
  updateAdminPlanSubscriptionSchema,
  getAdminPlanSubscriptionByIdSchema,
  getAllAdminPlanSubscriptionsSchema,
  getAdminPlanSubscriptionsByAuthSchema,
  getAdminPlanSubscriptionsByPlanIdParamsSchema,
  getAdminPlanSubscriptionsByPlanIdQuerySchema
} = require('../../../validators/Admin_Plan_Subscripiton.validator');

router.post('/create', auth, validateBody(createAdminPlanSubscriptionSchema), createAdminPlanSubscription);
router.get('/getAll', validateQuery(getAllAdminPlanSubscriptionsSchema), getAllAdminPlanSubscriptions);
router.get('/getById/:id', auth, validateParams(getAdminPlanSubscriptionByIdSchema), getAdminPlanSubscriptionById);
router.put('/update/:id', auth, validateParams(getAdminPlanSubscriptionByIdSchema), validateBody(updateAdminPlanSubscriptionSchema), updateAdminPlanSubscription);
router.delete('/delete/:id', auth, validateParams(getAdminPlanSubscriptionByIdSchema), deleteAdminPlanSubscription);
router.get('/getByPlanId/:Admin_Plan_id', auth, validateParams(getAdminPlanSubscriptionsByPlanIdParamsSchema), validateQuery(getAdminPlanSubscriptionsByPlanIdQuerySchema), getAdminPlanSubscriptionsByPlanId);
router.get('/getByAuth', auth, validateQuery(getAdminPlanSubscriptionsByAuthSchema), getAdminPlanSubscriptionsByAuth);

module.exports = router;

