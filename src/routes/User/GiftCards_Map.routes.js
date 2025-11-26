const express = require('express');
const router = express.Router();

const {
  createGiftCardsMap,
  getAllGiftCardsMaps,
  getGiftCardsMapById,
  updateGiftCardsMap,
  deleteGiftCardsMap,
  getGiftCardsMapByUserId,
  getGiftCardsMapByAuth
} = require('../../controllers/GiftCards_Map.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const {
  createGiftCardsMapSchema,
  updateGiftCardsMapSchema,
  getGiftCardsMapByIdSchema,
  getAllGiftCardsMapsSchema,
  getGiftCardsMapByUserIdParamsSchema,
  getGiftCardsMapByUserIdQuerySchema,
  getGiftCardsMapByAuthQuerySchema
} = require('../../../validators/GiftCards_Map.validator');

router.post('/create', auth, validateBody(createGiftCardsMapSchema), createGiftCardsMap);
router.get('/getAll', auth, validateQuery(getAllGiftCardsMapsSchema), getAllGiftCardsMaps);
router.get('/getById/:id', auth, validateParams(getGiftCardsMapByIdSchema), getGiftCardsMapById);
router.put('/update/:id', auth, validateParams(getGiftCardsMapByIdSchema), validateBody(updateGiftCardsMapSchema), updateGiftCardsMap);
router.delete('/delete/:id', auth, validateParams(getGiftCardsMapByIdSchema), deleteGiftCardsMap);
router.get('/getByUserId/:userId', auth, validateParams(getGiftCardsMapByUserIdParamsSchema), validateQuery(getGiftCardsMapByUserIdQuerySchema), getGiftCardsMapByUserId);
router.get('/getByAuth', auth, validateQuery(getGiftCardsMapByAuthQuerySchema), getGiftCardsMapByAuth);

module.exports = router;


