const express = require('express');
const router = express.Router();

const {
  createGiftCard,
  getAllGiftCards,
  getGiftCardById,
  updateGiftCard,
  deleteGiftCard,
  getGiftCardsByAuth
} = require('../../controllers/GiftCards.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const {
  createGiftCardSchema,
  updateGiftCardSchema,
  getGiftCardByIdSchema,
  getAllGiftCardsSchema,
  getGiftCardsByAuthSchema
} = require('../../../validators/GiftCards.validator');

router.post('/create', auth, validateBody(createGiftCardSchema), createGiftCard);
router.get('/getAll', validateQuery(getAllGiftCardsSchema), getAllGiftCards);
router.get('/getById/:id', auth, validateParams(getGiftCardByIdSchema), getGiftCardById);
router.put('/update/:id', auth, validateParams(getGiftCardByIdSchema), validateBody(updateGiftCardSchema), updateGiftCard);
router.delete('/delete/:id', auth, validateParams(getGiftCardByIdSchema), deleteGiftCard);
router.get('/getByAuth', auth, validateQuery(getGiftCardsByAuthSchema), getGiftCardsByAuth);

module.exports = router;


