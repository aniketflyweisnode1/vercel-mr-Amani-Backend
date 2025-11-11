const express = require('express');
const router = express.Router();

// Import controllers
const { createState, getAllStates, getStateById, updateState, deleteState } = require('../../controllers/state.controller.js');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createStateSchema, updateStateSchema, getStateByIdSchema, getAllStatesSchema } = require('../../../validators/state.validator');

// Routes
router.post('/create', auth, validateBody(createStateSchema), createState);
router.get('/getAll', validateQuery(getAllStatesSchema), getAllStates);
router.get('/getById/:id', auth, validateParams(getStateByIdSchema), getStateById);
router.put('/update/:id', auth, validateParams(getStateByIdSchema), validateBody(updateStateSchema), updateState);
router.delete('/delete/:id', auth, validateParams(getStateByIdSchema), deleteState);

module.exports = router;

