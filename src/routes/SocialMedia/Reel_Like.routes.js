const express = require('express');
const router = express.Router();

const { createReelLike, getAllReelLikes, getReelLikeById, updateReelLike, deleteReelLike, getReelLikesByAuth, getReelLikesByReelId } = require('../../controllers/Reel_Like.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createReelLikeSchema, updateReelLikeSchema, getReelLikeByIdSchema, getAllReelLikesSchema, getReelLikesByReelIdSchema } = require('../../../validators/Reel_Like.validator');

router.post('/create', auth, validateBody(createReelLikeSchema), createReelLike);
router.get('/getAll', validateQuery(getAllReelLikesSchema), getAllReelLikes);
router.get('/getById/:id', auth, validateParams(getReelLikeByIdSchema), getReelLikeById);
router.put('/update/:id', auth, validateParams(getReelLikeByIdSchema), validateBody(updateReelLikeSchema), updateReelLike);
router.delete('/delete/:id', auth, validateParams(getReelLikeByIdSchema), deleteReelLike);
router.get('/getByAuth', auth, validateQuery(getAllReelLikesSchema), getReelLikesByAuth);
router.get('/getByReelId/:reelId', validateParams(getReelLikesByReelIdSchema), validateQuery(getAllReelLikesSchema), getReelLikesByReelId);

module.exports = router;

