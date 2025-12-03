const express = require('express');
const router = express.Router();
const { auth } = require('../../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../../middleware/validation');
const {
  createFoodTruckCatering,
  getAllFoodTruckCatering,
  getFoodTruckCateringById,
  updateFoodTruckCatering,
  deleteFoodTruckCatering,
  getFoodTruckCateringByAuth
} = require('../../../../controllers/Food_Truck_Catering.controller');
const {
  createFoodTruckCateringSchema,
  updateFoodTruckCateringSchema,
  getFoodTruckCateringByIdSchema,
  getAllFoodTruckCateringSchema,
  getFoodTruckCateringByAuthSchema
} = require('../../../../../validators/Food_Truck_Catering.validator');

router.post('/create', auth, validateBody(createFoodTruckCateringSchema), createFoodTruckCatering);
router.get('/getAll', validateQuery(getAllFoodTruckCateringSchema), getAllFoodTruckCatering);
router.get('/getById/:id', auth, validateParams(getFoodTruckCateringByIdSchema), getFoodTruckCateringById);
router.put('/update/:id', auth, validateParams(getFoodTruckCateringByIdSchema), validateBody(updateFoodTruckCateringSchema), updateFoodTruckCatering);
router.delete('/delete/:id', auth, validateParams(getFoodTruckCateringByIdSchema), deleteFoodTruckCatering);
router.get('/getByAuth', auth, validateQuery(getFoodTruckCateringByAuthSchema), getFoodTruckCateringByAuth);

module.exports = router;

