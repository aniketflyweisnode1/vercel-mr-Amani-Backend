const express = require('express');
const router = express.Router();

// Import controllers
const { createHelpFeedback, getAllHelpFeedbacks, getHelpFeedbackById, updateHelpFeedback, deleteHelpFeedback, getHelpFeedbacksByAuth } = require('../../controllers/Help_Feedback.controller');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createHelpFeedbackSchema, updateHelpFeedbackSchema, getHelpFeedbackByIdSchema, getAllHelpFeedbacksSchema, getHelpFeedbacksByAuthSchema } = require('../../../validators/Help_Feedback.validator');

// Routes
router.post('/create', auth, validateBody(createHelpFeedbackSchema), createHelpFeedback);
router.get('/getAll', validateQuery(getAllHelpFeedbacksSchema), getAllHelpFeedbacks);
router.get('/getById/:id', auth, validateParams(getHelpFeedbackByIdSchema), getHelpFeedbackById);
router.put('/update/:id', auth, validateParams(getHelpFeedbackByIdSchema), validateBody(updateHelpFeedbackSchema), updateHelpFeedback);
router.delete('/delete/:id', auth, validateParams(getHelpFeedbackByIdSchema), deleteHelpFeedback);
router.get('/getByAuth', auth, validateQuery(getHelpFeedbacksByAuthSchema), getHelpFeedbacksByAuth);

module.exports = router;

