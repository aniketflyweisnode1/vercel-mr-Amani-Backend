const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createMarketingReword,
  getAllMarketingRewords,
  getMarketingRewordById,
  updateMarketingReword,
  deleteMarketingReword,
  getMarketingRewordsByAuth
} = require('../../controllers/Marketing_Reword.controller');
const {
  createMarketingRewordSchema,
  updateMarketingRewordSchema,
  getMarketingRewordByIdSchema,
  getAllMarketingRewordsSchema,
  getMarketingRewordsByAuthSchema
} = require('../../../validators/Marketing_Reword.validator');

router.post('/create', auth, validateBody(createMarketingRewordSchema), createMarketingReword);
router.get('/getAll', validateQuery(getAllMarketingRewordsSchema), getAllMarketingRewords);
router.get('/getById/:id', auth, validateParams(getMarketingRewordByIdSchema), getMarketingRewordById);
router.put('/update/:id', auth, validateParams(getMarketingRewordByIdSchema), validateBody(updateMarketingRewordSchema), updateMarketingReword);
router.delete('/delete/:id', auth, validateParams(getMarketingRewordByIdSchema), deleteMarketingReword);
router.get('/getByAuth', auth, validateQuery(getMarketingRewordsByAuthSchema), getMarketingRewordsByAuth);

module.exports = router;
