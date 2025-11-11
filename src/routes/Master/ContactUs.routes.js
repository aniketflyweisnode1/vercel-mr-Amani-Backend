const express = require('express');
const router = express.Router();

// Import controllers
const { createContactUs, getAllContactUs, getContactUsById, updateContactUs, deleteContactUs } = require('../../controllers/ContactUs.controller');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createContactUsSchema, updateContactUsSchema, getContactUsByIdSchema, getAllContactUsSchema } = require('../../../validators/ContactUs.validator');

// Routes
router.post('/create', auth, validateBody(createContactUsSchema), createContactUs);
router.get('/getAll', validateQuery(getAllContactUsSchema), getAllContactUs);
router.get('/getById/:id', auth, validateParams(getContactUsByIdSchema), getContactUsById);
router.put('/update/:id', auth, validateParams(getContactUsByIdSchema), validateBody(updateContactUsSchema), updateContactUs);
router.delete('/delete/:id', auth, validateParams(getContactUsByIdSchema), deleteContactUs);

module.exports = router;

