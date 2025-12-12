const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createRecentAcitvitysSchema, updateRecentAcitvitysSchema, getRecentAcitvitysByIdSchema, getAllRecentAcitvitysSchema, getRecentAcitvitysByAuthSchema } = require('../../../validators/RecentAcitvitys.validator');
const { createRecentAcitvitys, getAllRecentAcitvitys, getRecentAcitvitysById, updateRecentAcitvitys, deleteRecentAcitvitys, getRecentAcitvitysByAuth } = require('../../controllers/RecentAcitvitys.controller');

router.post('/create', auth, validateBody(createRecentAcitvitysSchema), createRecentAcitvitys);
router.get('/getAll', validateQuery(getAllRecentAcitvitysSchema), getAllRecentAcitvitys);
router.get('/getById/:id', auth, validateParams(getRecentAcitvitysByIdSchema), getRecentAcitvitysById);
router.put('/update/:id', auth, validateParams(getRecentAcitvitysByIdSchema), validateBody(updateRecentAcitvitysSchema), updateRecentAcitvitys);
router.delete('/delete/:id', auth, validateParams(getRecentAcitvitysByIdSchema), deleteRecentAcitvitys);
router.get('/getByAuth', auth, validateQuery(getRecentAcitvitysByAuthSchema), getRecentAcitvitysByAuth);

module.exports = router;
