const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createCampaignAllneedaPost,
  getAllCampaignAllneedaPosts,
  getCampaignAllneedaPostById,
  updateCampaignAllneedaPost,
  deleteCampaignAllneedaPost,
  getCampaignAllneedaPostsByAuth
} = require('../../controllers/CampaignAllneedaPost.controller');
const {
  createCampaignAllneedaPostSchema,
  updateCampaignAllneedaPostSchema,
  getCampaignAllneedaPostByIdSchema,
  getAllCampaignAllneedaPostsSchema,
  getCampaignAllneedaPostsByAuthSchema
} = require('../../../validators/CampaignAllneedaPost.validator');

router.post('/create', auth, validateBody(createCampaignAllneedaPostSchema), createCampaignAllneedaPost);
router.get('/getAll', validateQuery(getAllCampaignAllneedaPostsSchema), getAllCampaignAllneedaPosts);
router.get('/getById/:id', auth, validateParams(getCampaignAllneedaPostByIdSchema), getCampaignAllneedaPostById);
router.put('/update/:id', auth, validateParams(getCampaignAllneedaPostByIdSchema), validateBody(updateCampaignAllneedaPostSchema), updateCampaignAllneedaPost);
router.delete('/delete/:id', auth, validateParams(getCampaignAllneedaPostByIdSchema), deleteCampaignAllneedaPost);
router.get('/getByAuth', auth, validateQuery(getCampaignAllneedaPostsByAuthSchema), getCampaignAllneedaPostsByAuth);

module.exports = router;

