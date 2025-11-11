const express = require('express');
const router = express.Router();

const { createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom, getRoomsByAuth, getRoomsByRoomCategoryId } = require('../../controllers/Rooms.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createRoomSchema, updateRoomSchema, getRoomByIdSchema, getAllRoomsSchema, getRoomsByRoomCategoryIdSchema } = require('../../../validators/Rooms.validator');

router.post('/create', auth, validateBody(createRoomSchema), createRoom);
router.get('/getAll', validateQuery(getAllRoomsSchema), getAllRooms);
router.get('/getById/:id', auth, validateParams(getRoomByIdSchema), getRoomById);
router.put('/update/:id', auth, validateParams(getRoomByIdSchema), validateBody(updateRoomSchema), updateRoom);
router.delete('/delete/:id', auth, validateParams(getRoomByIdSchema), deleteRoom);
router.get('/getByAuth', auth, validateQuery(getAllRoomsSchema), getRoomsByAuth);
router.get('/getByRoomCategoryId/:roomCategoryId', validateParams(getRoomsByRoomCategoryIdSchema), validateQuery(getAllRoomsSchema), getRoomsByRoomCategoryId);

module.exports = router;

