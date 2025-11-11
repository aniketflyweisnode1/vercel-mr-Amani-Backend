const express = require('express');
const router = express.Router();

const { createReel, getAllReels, getReelById, updateReel, deleteReel, getReelsByAuth } = require('../../controllers/Reel.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createReelSchema, updateReelSchema, getReelByIdSchema, getAllReelsSchema } = require('../../../validators/Reel.validator');

router.post('/create', auth, validateBody(createReelSchema), createReel);
router.get('/getAll', validateQuery(getAllReelsSchema), getAllReels);
router.get('/getById/:id', auth, validateParams(getReelByIdSchema), getReelById);
router.put('/update/:id', auth, validateParams(getReelByIdSchema), validateBody(updateReelSchema), updateReel);
router.delete('/delete/:id', auth, validateParams(getReelByIdSchema), deleteReel);
router.get('/getByAuth', auth, validateQuery(getAllReelsSchema), getReelsByAuth);

module.exports = router;

