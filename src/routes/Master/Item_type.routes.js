const express = require('express');
const router = express.Router();

const {
  createItemType,
  getAllItemTypes,
  getItemTypesByAuthUser,
  getItemTypeById,
  updateItemType,
  deleteItemType
} = require('../../controllers/Item_type.controller.js');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const {
  createItemTypeSchema,
  updateItemTypeSchema,
  getItemTypeByIdSchema,
  getAllItemTypesSchema,
  getItemTypesByAuthSchema
} = require('../../../validators/Item_type.validator');

router.post('/create', auth, validateBody(createItemTypeSchema), createItemType);
router.get('/getAll', validateQuery(getAllItemTypesSchema), getAllItemTypes);
router.get('/getByAuth', auth, validateQuery(getItemTypesByAuthSchema), getItemTypesByAuthUser);
router.get('/getById/:id', auth, validateParams(getItemTypeByIdSchema), getItemTypeById);
router.put('/update/:id', auth, validateParams(getItemTypeByIdSchema), validateBody(updateItemTypeSchema), updateItemType);
router.delete('/delete/:id', auth, validateParams(getItemTypeByIdSchema), deleteItemType);

module.exports = router;

