const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createEffectsCategorys,
  getAllEffectsCategorys,
  getEffectsCategorysById,
  updateEffectsCategorys,
  deleteEffectsCategorys,
  getEffectsCategorysByAuth
} = require('../../controllers/Effects_Categorys.controller');
const {
  createEffectsCategorysSchema,
  updateEffectsCategorysSchema,
  getEffectsCategorysByIdSchema,
  getAllEffectsCategorysSchema,
  getEffectsCategorysByAuthSchema
} = require('../../../validators/Effects_Categorys.validator');

router.post('/create', auth, validateBody(createEffectsCategorysSchema), createEffectsCategorys);
router.get('/getAll', validateQuery(getAllEffectsCategorysSchema), getAllEffectsCategorys);
router.get('/getById/:id', auth, validateParams(getEffectsCategorysByIdSchema), getEffectsCategorysById);
router.put('/update/:id', auth, validateParams(getEffectsCategorysByIdSchema), validateBody(updateEffectsCategorysSchema), updateEffectsCategorys);
router.delete('/delete/:id', auth, validateParams(getEffectsCategorysByIdSchema), deleteEffectsCategorys);
router.get('/getByAuth', auth, validateQuery(getEffectsCategorysByAuthSchema), getEffectsCategorysByAuth);

module.exports = router;

