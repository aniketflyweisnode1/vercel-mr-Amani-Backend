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
  getReviewsByStoreId,
  getReviewsByStatus
} = require('../../controllers/Vendor_Products_Reviews.controller');
const {
  createReviewSchema,
  updateReviewSchema,
  getReviewByIdSchema,
  getAllReviewsSchema,
  getReviewsByAuthSchema,
  getReviewsByStoreParamsSchema,
  getReviewsByStatusParamsSchema,
  getReviewsByStoreQuerySchema
} = require('../../../validators/Vendor_Products_Reviews.validator');

router.post('/create', auth, validateBody(createReviewSchema), createReview);
router.get('/getAll', validateQuery(getAllReviewsSchema), getAllReviews);
router.get('/getById/:id', auth, validateParams(getReviewByIdSchema), getReviewById);
router.put('/update/:id', auth, validateParams(getReviewByIdSchema), validateBody(updateReviewSchema), updateReview);
router.delete('/delete/:id', auth, validateParams(getReviewByIdSchema), deleteReview);
router.get('/getByAuth', auth, validateQuery(getReviewsByAuthSchema), getReviewsByAuth);
router.get('/getByStoreId/:Vendor_Store_id', auth, validateParams(getReviewsByStoreParamsSchema), validateQuery(getReviewsByStoreQuerySchema), getReviewsByStoreId);
router.get('/getByStatus/:ReviewsStatus', auth, validateParams(getReviewsByStatusParamsSchema), validateQuery(getAllReviewsSchema), getReviewsByStatus);

module.exports = router;


