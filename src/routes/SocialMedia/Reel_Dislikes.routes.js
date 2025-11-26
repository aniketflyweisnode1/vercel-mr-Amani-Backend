const express = require('express');
const router = express.Router();

const { createReelDislikes, getAllReelDislikes, getReelDislikesById, updateReelDislikes, deleteReelDislikes, getReelDislikesByAuth, getReelDislikesByReelId } = require('../../controllers/Reel_Dislikes.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createReelDislikesSchema, updateReelDislikesSchema, getReelDislikesByIdSchema, getAllReelDislikesSchema, getReelDislikesByAuthSchema, getReelDislikesByReelIdParamsSchema, getReelDislikesByReelIdQuerySchema } = require('../../../validators/Reel_Dislikes.validator');

router.post('/create', auth, validateBody(createReelDislikesSchema), createReelDislikes);
router.get('/getAll', validateQuery(getAllReelDislikesSchema), getAllReelDislikes);
router.get('/getById/:id', auth, validateParams(getReelDislikesByIdSchema), getReelDislikesById);
router.put('/update/:id', auth, validateParams(getReelDislikesByIdSchema), validateBody(updateReelDislikesSchema), updateReelDislikes);
router.delete('/delete/:id', auth, validateParams(getReelDislikesByIdSchema), deleteReelDislikes);
router.get('/getByAuth', auth, validateQuery(getReelDislikesByAuthSchema), getReelDislikesByAuth);
router.get('/getByReelId/:reelId', validateParams(getReelDislikesByReelIdParamsSchema), validateQuery(getReelDislikesByReelIdQuerySchema), getReelDislikesByReelId);

module.exports = router;

