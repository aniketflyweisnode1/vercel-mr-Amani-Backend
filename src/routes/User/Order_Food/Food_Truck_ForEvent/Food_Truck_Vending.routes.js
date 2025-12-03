const express = require('express');
const router = express.Router();
const { auth } = require('../../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../../middleware/validation');
const {
  createFoodTruckVending,
  getAllFoodTruckVending,
  getFoodTruckVendingById,
  updateFoodTruckVending,
  deleteFoodTruckVending,
  getFoodTruckVendingByAuth,
  getFoodTruckVendingByPaymentOptions
} = require('../../../../controllers/Food_Truck_Vending.controller');
const {
  createFoodTruckVendingSchema,
  updateFoodTruckVendingSchema,
  getFoodTruckVendingByIdSchema,
  getAllFoodTruckVendingSchema,
  getFoodTruckVendingByAuthSchema,
  getFoodTruckVendingByPaymentOptionsSchema
} = require('../../../../../validators/Food_Truck_Vending.validator');

router.post('/create', auth, validateBody(createFoodTruckVendingSchema), createFoodTruckVending);
router.get('/getAll', validateQuery(getAllFoodTruckVendingSchema), getAllFoodTruckVending);
router.get('/getById/:id', auth, validateParams(getFoodTruckVendingByIdSchema), getFoodTruckVendingById);
router.put('/update/:id', auth, validateParams(getFoodTruckVendingByIdSchema), validateBody(updateFoodTruckVendingSchema), updateFoodTruckVending);
router.delete('/delete/:id', auth, validateParams(getFoodTruckVendingByIdSchema), deleteFoodTruckVending);
router.get('/getByAuth', auth, validateQuery(getFoodTruckVendingByAuthSchema), getFoodTruckVendingByAuth);
router.get('/getByPaymentOptions', auth, validateQuery(getFoodTruckVendingByPaymentOptionsSchema), getFoodTruckVendingByPaymentOptions);

module.exports = router;

