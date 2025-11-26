const express = require('express');
const router = express.Router();

const {
  createRewardsType,
  getAllRewardsTypes,
  getRewardsTypeById,
  updateRewardsType,
  deleteRewardsType,
  getRewardsTypesByAuth
} = require('../../controllers/Rewards_type.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const {
  createRewardsTypeSchema,
  updateRewardsTypeSchema,
  getRewardsTypeByIdSchema,
  getAllRewardsTypesSchema,
  getRewardsTypesByAuthSchema
} = require('../../../validators/Rewards_type.validator');

router.post('/create', auth, validateBody(createRewardsTypeSchema), createRewardsType);
router.get('/getAll', validateQuery(getAllRewardsTypesSchema), getAllRewardsTypes);
router.get('/getById/:id', auth, validateParams(getRewardsTypeByIdSchema), getRewardsTypeById);
router.put('/update/:id', auth, validateParams(getRewardsTypeByIdSchema), validateBody(updateRewardsTypeSchema), updateRewardsType);
router.delete('/delete/:id', auth, validateParams(getRewardsTypeByIdSchema), deleteRewardsType);
router.get('/getByAuth', auth, validateQuery(getRewardsTypesByAuthSchema), getRewardsTypesByAuth);

module.exports = router;


