const express = require('express');
const router = express.Router();

// Import controllers
const { createLanguage, getAllLanguages, getLanguageById, updateLanguage, deleteLanguage } = require('../../controllers/Language.controller');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createLanguageSchema, updateLanguageSchema, getLanguageByIdSchema, getAllLanguagesSchema } = require('../../../validators/Language.validator');

// Routes
router.post('/create', auth, validateBody(createLanguageSchema), createLanguage);
router.get('/getAll', validateQuery(getAllLanguagesSchema), getAllLanguages);
router.get('/getById/:id', auth, validateParams(getLanguageByIdSchema), getLanguageById);
router.put('/update/:id', auth, validateParams(getLanguageByIdSchema), validateBody(updateLanguageSchema), updateLanguage);
router.delete('/delete/:id', auth, validateParams(getLanguageByIdSchema), deleteLanguage);

module.exports = router;

