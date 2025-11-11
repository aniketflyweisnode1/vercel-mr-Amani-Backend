const express = require('express');
const router = express.Router();

// Import controllers
const { createProfilePage, getAllProfilePages, getProfilePageById, updateProfilePage, deleteProfilePage } = require('../../controllers/ProfilePage.controller');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createProfilePageSchema, updateProfilePageSchema, getProfilePageByIdSchema, getAllProfilePagesSchema } = require('../../../validators/ProfilePage.validator');

// Routes
router.post('/create', auth, validateBody(createProfilePageSchema), createProfilePage);
router.get('/getAll', validateQuery(getAllProfilePagesSchema), getAllProfilePages);
router.get('/getById/:id', auth, validateParams(getProfilePageByIdSchema), getProfilePageById);
router.put('/update/:id', auth, validateParams(getProfilePageByIdSchema), validateBody(updateProfilePageSchema), updateProfilePage);
router.delete('/delete/:id', auth, validateParams(getProfilePageByIdSchema), deleteProfilePage);

module.exports = router;

