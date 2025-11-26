const express = require('express');
const router = express.Router();

const {
  createReward,
  getAllRewards,
  getRewardById,
  updateReward,
  deleteReward,
  getRewardsByAuth
} = require('../../controllers/Rewards.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const {
  createRewardsSchema,
  updateRewardsSchema,
  getRewardsByIdSchema,
  getAllRewardsSchema,
  getRewardsByAuthSchema
} = require('../../../validators/Rewards.validator');

router.post('/create', auth, validateBody(createRewardsSchema), createReward);
router.get('/getAll', validateQuery(getAllRewardsSchema), getAllRewards);
router.get('/getById/:id', auth, validateParams(getRewardsByIdSchema), getRewardById);
router.put('/update/:id', auth, validateParams(getRewardsByIdSchema), validateBody(updateRewardsSchema), updateReward);
router.delete('/delete/:id', auth, validateParams(getRewardsByIdSchema), deleteReward);
router.get('/getByAuth', auth, validateQuery(getRewardsByAuthSchema), getRewardsByAuth);

module.exports = router;


