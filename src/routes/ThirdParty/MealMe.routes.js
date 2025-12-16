const express = require('express');
const router = express.Router();
const { validateQuery, validateBody } = require('../../../middleware/validation');
const { searchStoresByLocation, createMealMeOrder } = require('../../controllers/MealMe.controller');
const { searchStoresSchema, createOrderSchema } = require('../../../validators/MealMe.validator');

router.get('/search-stores', validateQuery(searchStoresSchema), searchStoresByLocation);
router.post('/create-order', validateBody(createOrderSchema), createMealMeOrder);

module.exports = router;
