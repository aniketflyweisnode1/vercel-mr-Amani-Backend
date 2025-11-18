const express = require('express');
const router = express.Router();

const {
  createItem,
  getAllItems,
  getItemsByAuthUser,
  getItemById,
  updateItem,
  deleteItem
} = require('../../controllers/Item.controller.js');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const {
  createItemSchema,
  updateItemSchema,
  getItemByIdSchema,
  getAllItemsSchema,
  getItemsByAuthSchema
} = require('../../../validators/Item.validator');

router.post('/create', auth, validateBody(createItemSchema), createItem);
router.get('/getAll', validateQuery(getAllItemsSchema), getAllItems);
router.get('/getByAuth', auth, validateQuery(getItemsByAuthSchema), getItemsByAuthUser);
router.get('/getById/:id', auth, validateParams(getItemByIdSchema), getItemById);
router.put('/update/:id', auth, validateParams(getItemByIdSchema), validateBody(updateItemSchema), updateItem);
router.delete('/delete/:id', auth, validateParams(getItemByIdSchema), deleteItem);

module.exports = router;

