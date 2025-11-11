const express = require('express');
const router = express.Router();

const { createInfluencer, getAllInfluencers, getInfluencerById, updateInfluencer, deleteInfluencer, getInfluencersByAuth } = require('../../controllers/Influencer.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createInfluencerSchema, updateInfluencerSchema, getInfluencerByIdSchema, getAllInfluencersSchema, getInfluencersByAuthSchema } = require('../../../validators/Influencer.validator');

router.post('/create', auth, validateBody(createInfluencerSchema), createInfluencer);
router.get('/getAll', validateQuery(getAllInfluencersSchema), getAllInfluencers);
router.get('/getById/:id', auth, validateParams(getInfluencerByIdSchema), getInfluencerById);
router.put('/update/:id', auth, validateParams(getInfluencerByIdSchema), validateBody(updateInfluencerSchema), updateInfluencer);
router.delete('/delete/:id', auth, validateParams(getInfluencerByIdSchema), deleteInfluencer);
router.get('/getByAuth', auth, validateQuery(getInfluencersByAuthSchema), getInfluencersByAuth);

module.exports = router;
