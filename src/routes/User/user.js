const express = require('express');
const router = express.Router();

// Import controllers
const { createUser, getAllUsers, getUserById, updateUser, deleteUser, activeDeviceLocation, changePassword } = require('../../controllers/user.controller.js');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createUserSchema, updateUserSchema, getUserByIdSchema, getAllUsersSchema, changePasswordSchema } = require('../../../validators/user.validator');

// Routes
router.post('/create', validateBody(createUserSchema), createUser);
router.get('/getAll', validateQuery(getAllUsersSchema), getAllUsers);
router.get('/getById/:id', auth, validateParams(getUserByIdSchema), getUserById);
router.put('/update/:id', auth, validateParams(getUserByIdSchema), validateBody(updateUserSchema), updateUser);
router.delete('/delete/:id', auth, validateParams(getUserByIdSchema), deleteUser);
router.put('/activeDeviceLocation', auth, activeDeviceLocation);
router.put('/changePassword', auth, validateBody(changePasswordSchema), changePassword);

module.exports = router;
