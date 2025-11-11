const express = require('express');
const router = express.Router();

// Import controllers
const { createRole, getAllRoles, getRoleById, updateRole, deleteRole } = require('../../controllers/role.controller');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createRoleSchema, updateRoleSchema, getRoleByIdSchema, getAllRolesSchema } = require('../../../validators/role.validator');

// Routes
router.post('/create', validateBody(createRoleSchema), createRole);
router.get('/getAll', validateQuery(getAllRolesSchema), getAllRoles);
router.get('/getById/:id', auth, validateParams(getRoleByIdSchema), getRoleById);
router.put('/update/:id', auth, validateParams(getRoleByIdSchema), validateBody(updateRoleSchema), updateRole);
router.delete('/delete/:id', auth, validateParams(getRoleByIdSchema), deleteRole);

module.exports = router;

