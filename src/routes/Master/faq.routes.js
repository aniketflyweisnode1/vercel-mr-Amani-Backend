const express = require('express');
const router = express.Router();

// Import controllers
const { createFaq, getAllFaqs, getFaqById, updateFaq, deleteFaq } = require('../../controllers/faq.controller');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createFaqSchema, updateFaqSchema, getFaqByIdSchema, getAllFaqsSchema } = require('../../../validators/faq.validator');

// Routes
router.post('/create', auth, validateBody(createFaqSchema), createFaq);
router.get('/getAll', validateQuery(getAllFaqsSchema), getAllFaqs);
router.get('/getById/:id', auth, validateParams(getFaqByIdSchema), getFaqById);
router.put('/update/:id', auth, validateParams(getFaqByIdSchema), validateBody(updateFaqSchema), updateFaq);
router.delete('/delete/:id', auth, validateParams(getFaqByIdSchema), deleteFaq);

module.exports = router;

