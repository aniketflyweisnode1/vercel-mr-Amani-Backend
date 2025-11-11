const express = require('express');
const router = express.Router();

const { createReelFollow, getAllReelFollows, getReelFollowById, updateReelFollow, deleteReelFollow, getReelFollowsByAuth, getReelFollowsByReelId } = require('../../controllers/Reel_Follow.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createReelFollowSchema, updateReelFollowSchema, getReelFollowByIdSchema, getAllReelFollowsSchema, getReelFollowsByReelIdSchema } = require('../../../validators/Reel_Follow.validator');

router.post('/create', auth, validateBody(createReelFollowSchema), createReelFollow);
router.get('/getAll', validateQuery(getAllReelFollowsSchema), getAllReelFollows);
router.get('/getById/:id', auth, validateParams(getReelFollowByIdSchema), getReelFollowById);
router.put('/update/:id', auth, validateParams(getReelFollowByIdSchema), validateBody(updateReelFollowSchema), updateReelFollow);
router.delete('/delete/:id', auth, validateParams(getReelFollowByIdSchema), deleteReelFollow);
router.get('/getByAuth', auth, validateQuery(getAllReelFollowsSchema), getReelFollowsByAuth);
router.get('/getByReelId/:reelId', validateParams(getReelFollowsByReelIdSchema), validateQuery(getAllReelFollowsSchema), getReelFollowsByReelId);

module.exports = router;

