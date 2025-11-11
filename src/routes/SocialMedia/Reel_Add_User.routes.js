const express = require('express');
const router = express.Router();

const { createReelAddUser, getAllReelAddUsers, getReelAddUserById, updateReelAddUser, deleteReelAddUser, getReelAddUsersByAuth } = require('../../controllers/Reel_Add_User.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createReelAddUserSchema, updateReelAddUserSchema, getReelAddUserByIdSchema, getAllReelAddUsersSchema } = require('../../../validators/Reel_Add_User.validator');

router.post('/create', auth, validateBody(createReelAddUserSchema), createReelAddUser);
router.get('/getAll', validateQuery(getAllReelAddUsersSchema), getAllReelAddUsers);
router.get('/getById/:id', auth, validateParams(getReelAddUserByIdSchema), getReelAddUserById);
router.put('/update/:id', auth, validateParams(getReelAddUserByIdSchema), validateBody(updateReelAddUserSchema), updateReelAddUser);
router.delete('/delete/:id', auth, validateParams(getReelAddUserByIdSchema), deleteReelAddUser);
router.get('/getByAuth', auth, validateQuery(getAllReelAddUsersSchema), getReelAddUsersByAuth);

module.exports = router;

