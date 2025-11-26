const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createRestaurantAlertType,
  getAllRestaurantAlertTypes,
  getRestaurantAlertTypeById,
  updateRestaurantAlertType,
  deleteRestaurantAlertType
} = require('../../controllers/Restaurant_Alerts_type.controller');
const {
  createRestaurantAlertTypeSchema,
  updateRestaurantAlertTypeSchema,
  getRestaurantAlertTypeByIdSchema,
  getAllRestaurantAlertTypesSchema
} = require('../../../validators/Restaurant_Alerts_type.validator');

router.post('/create', auth, validateBody(createRestaurantAlertTypeSchema), createRestaurantAlertType);
router.get('/getAll', validateQuery(getAllRestaurantAlertTypesSchema), getAllRestaurantAlertTypes);
router.get('/getById/:id', auth, validateParams(getRestaurantAlertTypeByIdSchema), getRestaurantAlertTypeById);
router.put('/update/:id', auth, validateParams(getRestaurantAlertTypeByIdSchema), validateBody(updateRestaurantAlertTypeSchema), updateRestaurantAlertType);
router.delete('/delete/:id', auth, validateParams(getRestaurantAlertTypeByIdSchema), deleteRestaurantAlertType);

module.exports = router;


