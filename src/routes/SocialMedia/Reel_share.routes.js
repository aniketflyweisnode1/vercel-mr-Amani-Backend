const express = require('express');
const router = express.Router();

const { createReelShare, getAllReelShares, getReelShareById, updateReelShare, deleteReelShare, getReelSharesByAuth, getReelSharesByReelId } = require('../../controllers/Reel_share.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createReelShareSchema, updateReelShareSchema, getReelShareByIdSchema, getAllReelSharesSchema, getReelSharesByReelIdSchema } = require('../../../validators/Reel_share.validator');

router.post('/create', auth, validateBody(createReelShareSchema), createReelShare);
router.get('/getAll', validateQuery(getAllReelSharesSchema), getAllReelShares);
router.get('/getById/:id', auth, validateParams(getReelShareByIdSchema), getReelShareById);
router.put('/update/:id', auth, validateParams(getReelShareByIdSchema), validateBody(updateReelShareSchema), updateReelShare);
router.delete('/delete/:id', auth, validateParams(getReelShareByIdSchema), deleteReelShare);
router.get('/getByAuth', auth, validateQuery(getAllReelSharesSchema), getReelSharesByAuth);
router.get('/getByReelId/:reelId', validateParams(getReelSharesByReelIdSchema), validateQuery(getAllReelSharesSchema), getReelSharesByReelId);

module.exports = router;

