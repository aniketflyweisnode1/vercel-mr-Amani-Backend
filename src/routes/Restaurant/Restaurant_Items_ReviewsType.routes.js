const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createReviewsType,
  getAllReviewsTypes,
  getReviewsTypeById,
  updateReviewsType,
  deleteReviewsType,
  getReviewsTypesByAuth
} = require('../../controllers/Restaurant_Items_ReviewsType.controller');
const {
  createReviewsTypeSchema,
  updateReviewsTypeSchema,
  getReviewsTypeByIdSchema,
  getAllReviewsTypesSchema,
  getReviewsTypesByAuthSchema
} = require('../../../validators/Restaurant_Items_ReviewsType.validator');

router.post('/create', auth, validateBody(createReviewsTypeSchema), createReviewsType);
router.get('/getAll', validateQuery(getAllReviewsTypesSchema), getAllReviewsTypes);
router.get('/getById/:id', auth, validateParams(getReviewsTypeByIdSchema), getReviewsTypeById);
router.put('/update/:id', auth, validateParams(getReviewsTypeByIdSchema), validateBody(updateReviewsTypeSchema), updateReviewsType);
router.delete('/delete/:id', auth, validateParams(getReviewsTypeByIdSchema), deleteReviewsType);
router.get('/getByAuth', auth, validateQuery(getReviewsTypesByAuthSchema), getReviewsTypesByAuth);

module.exports = router;


