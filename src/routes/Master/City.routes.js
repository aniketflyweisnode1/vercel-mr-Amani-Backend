const express = require('express');
const router = express.Router();

// Import controllers
const { createCity, getAllCities, getCityById, updateCity, deleteCity } = require('../../controllers/city.controller');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createCitySchema, updateCitySchema, getCityByIdSchema, getAllCitiesSchema } = require('../../../validators/city.validator');

// Routes
router.post('/create', auth, validateBody(createCitySchema), createCity);
router.get('/getAll', validateQuery(getAllCitiesSchema), getAllCities);
router.get('/getById/:id', auth, validateParams(getCityByIdSchema), getCityById);
router.put('/update/:id', auth, validateParams(getCityByIdSchema), validateBody(updateCitySchema), updateCity);
router.delete('/delete/:id', auth, validateParams(getCityByIdSchema), deleteCity);

module.exports = router;

