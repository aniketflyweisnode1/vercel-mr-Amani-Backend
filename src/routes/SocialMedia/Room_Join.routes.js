const express = require('express');
const router = express.Router();

const { createRoomJoin, getAllRoomJoins, getRoomJoinById, updateRoomJoin, deleteRoomJoin, getRoomJoinsByAuth, getRoomJoinsByRoomId } = require('../../controllers/Room_Join.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createRoomJoinSchema, updateRoomJoinSchema, getRoomJoinByIdSchema, getAllRoomJoinsSchema, getRoomJoinsByRoomIdSchema } = require('../../../validators/Room_Join.validator');

router.post('/create', auth, validateBody(createRoomJoinSchema), createRoomJoin);
router.get('/getAll', validateQuery(getAllRoomJoinsSchema), getAllRoomJoins);
router.get('/getById/:id', auth, validateParams(getRoomJoinByIdSchema), getRoomJoinById);
router.put('/update/:id', auth, validateParams(getRoomJoinByIdSchema), validateBody(updateRoomJoinSchema), updateRoomJoin);
router.delete('/delete/:id', auth, validateParams(getRoomJoinByIdSchema), deleteRoomJoin);
router.get('/getByAuth', auth, validateQuery(getAllRoomJoinsSchema), getRoomJoinsByAuth);
router.get('/getByRoomId/:roomId', validateParams(getRoomJoinsByRoomIdSchema), validateQuery(getAllRoomJoinsSchema), getRoomJoinsByRoomId);

module.exports = router;

