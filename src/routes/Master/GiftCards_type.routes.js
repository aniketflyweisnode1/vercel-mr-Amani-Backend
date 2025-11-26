const express = require('express');
const router = express.Router();

const {
  createGiftCardsType,
  getAllGiftCardsTypes,
  getGiftCardsTypeById,
  updateGiftCardsType,
  deleteGiftCardsType,
  getGiftCardsTypesByAuth
} = require('../../controllers/GiftCards_type.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const {
  createGiftCardsTypeSchema,
  updateGiftCardsTypeSchema,
  getGiftCardsTypeByIdSchema,
  getAllGiftCardsTypesSchema,
  getGiftCardsTypesByAuthSchema
} = require('../../../validators/GiftCards_type.validator');

router.post('/create', auth, validateBody(createGiftCardsTypeSchema), createGiftCardsType);
router.get('/getAll', validateQuery(getAllGiftCardsTypesSchema), getAllGiftCardsTypes);
router.get('/getById/:id', auth, validateParams(getGiftCardsTypeByIdSchema), getGiftCardsTypeById);
router.put('/update/:id', auth, validateParams(getGiftCardsTypeByIdSchema), validateBody(updateGiftCardsTypeSchema), updateGiftCardsType);
router.delete('/delete/:id', auth, validateParams(getGiftCardsTypeByIdSchema), deleteGiftCardsType);
router.get('/getByAuth', auth, validateQuery(getGiftCardsTypesByAuthSchema), getGiftCardsTypesByAuth);

module.exports = router;


