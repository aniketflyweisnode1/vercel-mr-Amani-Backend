const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createReward,
  getAllRewards,
  getRewardById,
  updateReward,
  deleteReward,
  getRewardsByAuth
} = require('../../controllers/Marketing_Promotions_Reward.controller');
const {
  createRewardSchema,
  updateRewardSchema,
  getRewardByIdSchema,
  getAllRewardsSchema,
  getRewardsByAuthSchema
} = require('../../../validators/Marketing_Promotions_Reward.validator');

router.post('/create', auth, validateBody(createRewardSchema), createReward);
router.get('/getAll', validateQuery(getAllRewardsSchema), getAllRewards);
router.get('/getById/:id', auth, validateParams(getRewardByIdSchema), getRewardById);
router.put('/update/:id', auth, validateParams(getRewardByIdSchema), validateBody(updateRewardSchema), updateReward);
router.delete('/delete/:id', auth, validateParams(getRewardByIdSchema), deleteReward);
router.get('/getByAuth', auth, validateQuery(getRewardsByAuthSchema), getRewardsByAuth);

module.exports = router;

