const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createFavourite,
  getAllFavourites,
  getFavouriteById,
  updateFavourite,
  deleteFavourite,
  getFavouritesByAuth,
  getFavouritesByBusinessBranchId
} = require('../../controllers/Favourites.controller');
const {
  createFavouritesSchema,
  updateFavouritesSchema,
  getFavouritesByIdSchema,
  getAllFavouritesSchema,
  getFavouritesByAuthSchema,
  getFavouritesByBusinessBranchIdParamsSchema,
  getFavouritesByBusinessBranchIdQuerySchema
} = require('../../../validators/Favourites.validator');

/**
 * @route   POST /api/Favourites/create
 * @desc    Create a new favourite
 * @access  Private (Auth required)
 */
router.post('/create', auth, validateBody(createFavouritesSchema), createFavourite);

/**
 * @route   GET /api/Favourites/getAll
 * @desc    Get all favourites with pagination and filtering
 * @access  Public
 */
router.get('/getAll', validateQuery(getAllFavouritesSchema), getAllFavourites);

/**
 * @route   GET /api/Favourites/getById/:id
 * @desc    Get favourite by ID
 * @access  Private (Auth required)
 */
router.get('/getById/:id', auth, validateParams(getFavouritesByIdSchema), getFavouriteById);

/**
 * @route   PUT /api/Favourites/update/:id
 * @desc    Update favourite by ID
 * @access  Private (Auth required)
 */
router.put('/update/:id', auth, validateParams(getFavouritesByIdSchema), validateBody(updateFavouritesSchema), updateFavourite);

/**
 * @route   DELETE /api/Favourites/delete/:id
 * @desc    Delete favourite by ID (soft delete)
 * @access  Private (Auth required)
 */
router.delete('/delete/:id', auth, validateParams(getFavouritesByIdSchema), deleteFavourite);

/**
 * @route   GET /api/Favourites/getByAuth
 * @desc    Get favourites created by authenticated user
 * @access  Private (Auth required)
 */
router.get('/getByAuth', auth, validateQuery(getFavouritesByAuthSchema), getFavouritesByAuth);

/**
 * @route   GET /api/Favourites/getByBusinessBranchId/:business_Branch_id
 * @desc    Get favourites by business branch ID
 * @access  Private (Auth required)
 */
router.get('/getByBusinessBranchId/:business_Branch_id', auth, validateParams(getFavouritesByBusinessBranchIdParamsSchema), validateQuery(getFavouritesByBusinessBranchIdQuerySchema), getFavouritesByBusinessBranchId);

module.exports = router;

