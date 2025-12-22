const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createEffects,
  getAllEffects,
  getEffectsById,
  updateEffects,
  deleteEffects,
  getEffectsByCategoryId,
  getEffectsByAuth
} = require('../../controllers/Effects.controller');
const {
  createEffectsSchema,
  updateEffectsSchema,
  getEffectsByIdSchema,
  getAllEffectsSchema,
  getEffectsByAuthSchema,
  getEffectsByCategoryIdParamsSchema,
  getEffectsByCategoryIdQuerySchema
} = require('../../../validators/Effects.validator');

router.post('/create', auth, validateBody(createEffectsSchema), createEffects);
router.get('/getAll', validateQuery(getAllEffectsSchema), getAllEffects);
router.get('/getById/:id', auth, validateParams(getEffectsByIdSchema), getEffectsById);
router.put('/update/:id', auth, validateParams(getEffectsByIdSchema), validateBody(updateEffectsSchema), updateEffects);
router.delete('/delete/:id', auth, validateParams(getEffectsByIdSchema), deleteEffects);
router.get('/getByCategoryId/:id', validateParams(getEffectsByCategoryIdParamsSchema), validateQuery(getEffectsByCategoryIdQuerySchema), getEffectsByCategoryId);
router.get('/getByAuth', auth, validateQuery(getEffectsByAuthSchema), getEffectsByAuth);

module.exports = router;

