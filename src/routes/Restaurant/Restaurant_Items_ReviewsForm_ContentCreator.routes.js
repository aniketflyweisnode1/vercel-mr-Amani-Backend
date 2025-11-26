const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createContentCreator,
  getAllContentCreators,
  getContentCreatorById,
  updateContentCreator,
  deleteContentCreator,
  getContentCreatorsByAuth
} = require('../../controllers/Restaurant_Items_ReviewsForm_ContentCreator.controller');
const {
  createContentCreatorSchema,
  updateContentCreatorSchema,
  getContentCreatorByIdSchema,
  getAllContentCreatorsSchema,
  getContentCreatorsByAuthSchema
} = require('../../../validators/Restaurant_Items_ReviewsForm_ContentCreator.validator');

router.post('/create', auth, validateBody(createContentCreatorSchema), createContentCreator);
router.get('/getAll', validateQuery(getAllContentCreatorsSchema), getAllContentCreators);
router.get('/getById/:id', auth, validateParams(getContentCreatorByIdSchema), getContentCreatorById);
router.put('/update/:id', auth, validateParams(getContentCreatorByIdSchema), validateBody(updateContentCreatorSchema), updateContentCreator);
router.delete('/delete/:id', auth, validateParams(getContentCreatorByIdSchema), deleteContentCreator);
router.get('/getByAuth', auth, validateQuery(getContentCreatorsByAuthSchema), getContentCreatorsByAuth);

module.exports = router;


