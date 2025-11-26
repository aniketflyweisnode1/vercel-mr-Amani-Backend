const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createSocialMediaPost,
  getAllSocialMediaPosts,
  getSocialMediaPostById,
  updateSocialMediaPost,
  deleteSocialMediaPost,
  getSocialMediaPostsByAuth,
  getSocialMediaPostsByBranchId
} = require('../../controllers/SocialMedia_Post.controller');
const {
  createSocialMediaPostSchema,
  updateSocialMediaPostSchema,
  getSocialMediaPostByIdSchema,
  getAllSocialMediaPostsSchema,
  getSocialMediaPostsByAuthSchema,
  getSocialMediaPostsByBranchParamsSchema
} = require('../../../validators/SocialMedia_Post.validator');

router.post('/create', auth, validateBody(createSocialMediaPostSchema), createSocialMediaPost);
router.get('/getAll', validateQuery(getAllSocialMediaPostsSchema), getAllSocialMediaPosts);
router.get('/getById/:id', auth, validateParams(getSocialMediaPostByIdSchema), getSocialMediaPostById);
router.put('/update/:id', auth, validateParams(getSocialMediaPostByIdSchema), validateBody(updateSocialMediaPostSchema), updateSocialMediaPost);
router.delete('/delete/:id', auth, validateParams(getSocialMediaPostByIdSchema), deleteSocialMediaPost);
router.get('/getByAuth', auth, validateQuery(getSocialMediaPostsByAuthSchema), getSocialMediaPostsByAuth);
router.get('/getByBranchId/:business_Branch_id', auth, validateQuery(getAllSocialMediaPostsSchema), validateParams(getSocialMediaPostsByBranchParamsSchema), getSocialMediaPostsByBranchId);

module.exports = router;

