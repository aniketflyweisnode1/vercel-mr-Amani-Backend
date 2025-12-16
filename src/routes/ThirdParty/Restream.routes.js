const express = require('express');
const router = express.Router();
const { validateQuery, validateBody } = require('../../../middleware/validation');
const { getLoginUrl, oauthCallback, getProfile, callAPI } = require('../../controllers/Restream.controller');
const { getLoginUrlSchema, oauthCallbackSchema, callAPISchema } = require('../../../validators/Restream.validator');

router.get('/login', validateQuery(getLoginUrlSchema), getLoginUrl);
router.get('/oauth/callback', validateQuery(oauthCallbackSchema), oauthCallback);
router.get('/me', getProfile);
router.post('/api-call', validateBody(callAPISchema), callAPI);

module.exports = router;
