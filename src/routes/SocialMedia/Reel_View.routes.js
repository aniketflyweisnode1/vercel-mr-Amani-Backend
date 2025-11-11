const express = require('express');
const router = express.Router();

const { createReelView, getAllReelViews, getReelViewById, updateReelView, deleteReelView, getReelViewsByAuth, getReelViewsByReelId } = require('../../controllers/Reel_View.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createReelViewSchema, updateReelViewSchema, getReelViewByIdSchema, getAllReelViewsSchema, getReelViewsByReelIdSchema } = require('../../../validators/Reel_View.validator');

router.post('/create', auth, validateBody(createReelViewSchema), createReelView);
router.get('/getAll', validateQuery(getAllReelViewsSchema), getAllReelViews);
router.get('/getById/:id', auth, validateParams(getReelViewByIdSchema), getReelViewById);
router.put('/update/:id', auth, validateParams(getReelViewByIdSchema), validateBody(updateReelViewSchema), updateReelView);
router.delete('/delete/:id', auth, validateParams(getReelViewByIdSchema), deleteReelView);
router.get('/getByAuth', auth, validateQuery(getAllReelViewsSchema), getReelViewsByAuth);
router.get('/getByReelId/:reelId', validateParams(getReelViewsByReelIdSchema), validateQuery(getAllReelViewsSchema), getReelViewsByReelId);

module.exports = router;

