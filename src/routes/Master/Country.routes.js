const express = require('express');
const router = express.Router();

// Import controllers
const { createCountry, getAllCountries, getCountryById, updateCountry, deleteCountry } = require('../../controllers/country.controller.js');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createCountrySchema, updateCountrySchema, getCountryByIdSchema, getAllCountriesSchema } = require('../../../validators/country.validator');

// Routes
router.post('/create', auth, validateBody(createCountrySchema), createCountry);
router.get('/getAll', validateQuery(getAllCountriesSchema), getAllCountries);
router.get('/getById/:id', auth, validateParams(getCountryByIdSchema), getCountryById);
router.put('/update/:id', auth, validateParams(getCountryByIdSchema), validateBody(updateCountrySchema), updateCountry);
router.delete('/delete/:id', auth, validateParams(getCountryByIdSchema), deleteCountry);

module.exports = router;

