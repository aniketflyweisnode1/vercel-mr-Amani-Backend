const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByAuth,
  getReviewsByBranchId,
  getReviewsByStatus
} = require('../../controllers/Restaurant_Items_Reviews.controller');
const {
  createReviewSchema,
  updateReviewSchema,
  getReviewByIdSchema,
  getAllReviewsSchema,
  getReviewsByAuthSchema,
  getReviewsByBranchParamsSchema,
  getReviewsByStatusParamsSchema,
  getReviewsByBranchQuerySchema
} = require('../../../validators/Restaurant_Items_Reviews.validator');

router.post('/create', auth, validateBody(createReviewSchema), createReview);
router.get('/getAll', validateQuery(getAllReviewsSchema), getAllReviews);
router.get('/getById/:id', auth, validateParams(getReviewByIdSchema), getReviewById);
router.put('/update/:id', auth, validateParams(getReviewByIdSchema), validateBody(updateReviewSchema), updateReview);
router.delete('/delete/:id', auth, validateParams(getReviewByIdSchema), deleteReview);
router.get('/getByAuth', auth, validateQuery(getReviewsByAuthSchema), getReviewsByAuth);
router.get('/getByBranchId/:business_Branch_id', auth, validateQuery(getReviewsByBranchQuerySchema), validateParams(getReviewsByBranchParamsSchema), getReviewsByBranchId);
router.get('/getByReviewsStatus/:ReviewsStatus', auth, validateParams(getReviewsByStatusParamsSchema), getReviewsByStatus);

module.exports = router;


