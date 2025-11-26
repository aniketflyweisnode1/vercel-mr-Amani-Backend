const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createRestaurantAlert,
  getAllRestaurantAlerts,
  getRestaurantAlertById,
  updateRestaurantAlert,
  deleteRestaurantAlert,
  getRestaurantAlertsByTypeId,
  getRestaurantAlertsByAuth,
  getRestaurantAlertsByModel
} = require('../../controllers/Restaurant_Alerts.controller');
const {
  createRestaurantAlertSchema,
  updateRestaurantAlertSchema,
  getRestaurantAlertByIdSchema,
  getAllRestaurantAlertsSchema,
  getRestaurantAlertsByAuthSchema,
  getRestaurantAlertsByTypeIdParamsSchema,
  getRestaurantAlertsByModelQuerySchema
} = require('../../../validators/Restaurant_Alerts.validator');

router.post('/create', auth, validateBody(createRestaurantAlertSchema), createRestaurantAlert);
router.get('/getAll', validateQuery(getAllRestaurantAlertsSchema), getAllRestaurantAlerts);
router.get('/getById/:id', auth, validateParams(getRestaurantAlertByIdSchema), getRestaurantAlertById);
router.put('/update/:id', auth, validateParams(getRestaurantAlertByIdSchema), validateBody(updateRestaurantAlertSchema), updateRestaurantAlert);
router.delete('/delete/:id', auth, validateParams(getRestaurantAlertByIdSchema), deleteRestaurantAlert);
router.get('/getByTypeId/:Restaurant_Alerts_type_id', auth, validateParams(getRestaurantAlertsByTypeIdParamsSchema), getRestaurantAlertsByTypeId);
router.get('/getByAuth', auth, validateQuery(getRestaurantAlertsByAuthSchema), getRestaurantAlertsByAuth);
router.get('/getByModel', auth, validateQuery(getRestaurantAlertsByModelQuerySchema), getRestaurantAlertsByModel);

module.exports = router;


