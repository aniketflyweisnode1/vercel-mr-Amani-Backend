const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory,
  getStoriesByAuth
} = require('../../controllers/Story.controller');
const {
  createStorySchema,
  updateStorySchema,
  getStoryByIdSchema,
  getAllStoriesSchema,
  getStoriesByAuthSchema
} = require('../../../validators/Story.validator');

router.post('/create', auth, validateBody(createStorySchema), createStory);
router.get('/getAll', validateQuery(getAllStoriesSchema), getAllStories);
router.get('/getById/:id', auth, validateParams(getStoryByIdSchema), getStoryById);
router.put('/update/:id', auth, validateParams(getStoryByIdSchema), validateBody(updateStorySchema), updateStory);
router.delete('/delete/:id', auth, validateParams(getStoryByIdSchema), deleteStory);
router.get('/getByAuth', auth, validateQuery(getStoriesByAuthSchema), getStoriesByAuth);

module.exports = router;

