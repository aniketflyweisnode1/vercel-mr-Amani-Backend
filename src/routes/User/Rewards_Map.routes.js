const express = require('express');
const router = express.Router();

const {
  createRewardsMap,
  getAllRewardsMaps,
  getRewardsMapById,
  updateRewardsMap,
  deleteRewardsMap,
  getRewardsMapByUserId,
  getRewardsMapByAuth
} = require('../../controllers/Rewards_Map.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const {
  createRewardsMapSchema,
  updateRewardsMapSchema,
  getRewardsMapByIdSchema,
  getAllRewardsMapsSchema,
  getRewardsMapByUserIdParamsSchema,
  getRewardsMapByUserIdQuerySchema,
  getRewardsMapByAuthQuerySchema
} = require('../../../validators/Rewards_Map.validator');

router.post('/create', auth, validateBody(createRewardsMapSchema), createRewardsMap);
router.get('/getAll', auth, validateQuery(getAllRewardsMapsSchema), getAllRewardsMaps);
router.get('/getById/:id', auth, validateParams(getRewardsMapByIdSchema), getRewardsMapById);
router.put('/update/:id', auth, validateParams(getRewardsMapByIdSchema), validateBody(updateRewardsMapSchema), updateRewardsMap);
router.delete('/delete/:id', auth, validateParams(getRewardsMapByIdSchema), deleteRewardsMap);
router.get('/getByUserId/:userId', auth, validateParams(getRewardsMapByUserIdParamsSchema), validateQuery(getRewardsMapByUserIdQuerySchema), getRewardsMapByUserId);
router.get('/getByAuth', auth, validateQuery(getRewardsMapByAuthQuerySchema), getRewardsMapByAuth);

module.exports = router;


