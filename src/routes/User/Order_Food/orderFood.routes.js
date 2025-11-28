const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateParams } = require('../../../../middleware/validation');
const { getStoreByItemId } = require('../../../controllers/OrderFood.controller');
const { getStoreByItemIdParamsSchema } = require('../../../../validators/OrderFood.validator');

router.get('/getStoreByItemId/:Item_id', auth, validateParams(getStoreByItemIdParamsSchema), getStoreByItemId);

module.exports = router;

