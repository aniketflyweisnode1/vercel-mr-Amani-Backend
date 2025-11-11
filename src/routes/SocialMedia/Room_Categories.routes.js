const express = require('express');
const router = express.Router();

const { createRoomCategory, getAllRoomCategories, getRoomCategoryById, updateRoomCategory, deleteRoomCategory, getRoomCategoriesByAuth } = require('../../controllers/Room_Categories.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createRoomCategorySchema, updateRoomCategorySchema, getRoomCategoryByIdSchema, getAllRoomCategoriesSchema } = require('../../../validators/Room_Categories.validator');

router.post('/create', auth, validateBody(createRoomCategorySchema), createRoomCategory);
router.get('/getAll', validateQuery(getAllRoomCategoriesSchema), getAllRoomCategories);
router.get('/getById/:id', auth, validateParams(getRoomCategoryByIdSchema), getRoomCategoryById);
router.put('/update/:id', auth, validateParams(getRoomCategoryByIdSchema), validateBody(updateRoomCategorySchema), updateRoomCategory);
router.delete('/delete/:id', auth, validateParams(getRoomCategoryByIdSchema), deleteRoomCategory);
router.get('/getByAuth', auth, validateQuery(getAllRoomCategoriesSchema), getRoomCategoriesByAuth);

module.exports = router;

