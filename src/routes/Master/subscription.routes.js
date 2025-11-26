const express = require('express');
const router = express.Router();

const { createSubscription, getAllSubscriptions, getSubscriptionById, updateSubscription, deleteSubscription, getSubscriptionsByAuth } = require('../../controllers/subscription.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createSubscriptionSchema, updateSubscriptionSchema, getSubscriptionByIdSchema, getAllSubscriptionsSchema, getSubscriptionsByAuthSchema } = require('../../../validators/subscription.validator');

router.post('/create', auth, validateBody(createSubscriptionSchema), createSubscription);
router.get('/getAll', validateQuery(getAllSubscriptionsSchema), getAllSubscriptions);
router.get('/getById/:id', auth, validateParams(getSubscriptionByIdSchema), getSubscriptionById);
router.put('/update/:id', auth, validateParams(getSubscriptionByIdSchema), validateBody(updateSubscriptionSchema), updateSubscription);
router.delete('/delete/:id', auth, validateParams(getSubscriptionByIdSchema), deleteSubscription);
router.get('/getByAuth', auth, validateQuery(getSubscriptionsByAuthSchema), getSubscriptionsByAuth);

module.exports = router;

