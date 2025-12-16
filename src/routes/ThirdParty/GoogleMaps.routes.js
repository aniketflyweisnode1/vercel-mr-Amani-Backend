const express = require('express');
const router = express.Router();
const { validateBody } = require('../../../middleware/validation');
const { geocode, reverseGeocodeCoordinates } = require('../../controllers/GoogleMaps.controller');
const { geocodeSchema, reverseGeocodeSchema } = require('../../../validators/GoogleMaps.validator');

router.post('/geocode', validateBody(geocodeSchema), geocode);
router.post('/reverse-geocode', validateBody(reverseGeocodeSchema), reverseGeocodeCoordinates);

module.exports = router;
