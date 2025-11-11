const express = require('express');
const router = express.Router();

const { createReelComment, getAllReelComments, getReelCommentById, updateReelComment, deleteReelComment, getReelCommentsByAuth, getReelCommentsByReelId } = require('../../controllers/Reel_Comment.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createReelCommentSchema, updateReelCommentSchema, getReelCommentByIdSchema, getAllReelCommentsSchema, getReelCommentsByReelIdSchema } = require('../../../validators/Reel_Comment.validator');

router.post('/create', auth, validateBody(createReelCommentSchema), createReelComment);
router.get('/getAll', validateQuery(getAllReelCommentsSchema), getAllReelComments);
router.get('/getById/:id', auth, validateParams(getReelCommentByIdSchema), getReelCommentById);
router.put('/update/:id', auth, validateParams(getReelCommentByIdSchema), validateBody(updateReelCommentSchema), updateReelComment);
router.delete('/delete/:id', auth, validateParams(getReelCommentByIdSchema), deleteReelComment);
router.get('/getByAuth', auth, validateQuery(getAllReelCommentsSchema), getReelCommentsByAuth);
router.get('/getByReelId/:reelId', validateParams(getReelCommentsByReelIdSchema), validateQuery(getAllReelCommentsSchema), getReelCommentsByReelId);

module.exports = router;

