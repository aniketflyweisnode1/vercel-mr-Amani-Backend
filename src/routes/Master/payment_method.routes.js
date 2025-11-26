const express = require('express');
const router = express.Router();

const { createPaymentMethod, getAllPaymentMethods, getPaymentMethodById, updatePaymentMethod, deletePaymentMethod, getPaymentMethodsByAuth } = require('../../controllers/payment_method.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createPaymentMethodSchema, updatePaymentMethodSchema, getPaymentMethodByIdSchema, getAllPaymentMethodsSchema, getPaymentMethodsByAuthSchema } = require('../../../validators/payment_method.validator');

router.post('/create', auth, validateBody(createPaymentMethodSchema), createPaymentMethod);
router.get('/getAll', validateQuery(getAllPaymentMethodsSchema), getAllPaymentMethods);
router.get('/getById/:id', auth, validateParams(getPaymentMethodByIdSchema), getPaymentMethodById);
router.put('/update/:id', auth, validateParams(getPaymentMethodByIdSchema), validateBody(updatePaymentMethodSchema), updatePaymentMethod);
router.delete('/delete/:id', auth, validateParams(getPaymentMethodByIdSchema), deletePaymentMethod);
router.get('/getByAuth', auth, validateQuery(getPaymentMethodsByAuthSchema), getPaymentMethodsByAuth);

module.exports = router;

