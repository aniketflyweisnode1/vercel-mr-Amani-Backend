const express = require('express');
const router = express.Router();

const {
  createFavorite,
  getAllFavorites,
  getFavoritesByAuthUser,
  getFavoriteById,
  updateFavorite,
  deleteFavorite
} = require('../../controllers/myFavorites.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const {
  createFavoriteSchema,
  updateFavoriteSchema,
  getFavoriteByIdSchema,
  getAllFavoritesSchema,
  getFavoritesByAuthSchema
} = require('../../../validators/myFavorites.validator');

router.post('/create', auth, validateBody(createFavoriteSchema), createFavorite);
router.get('/getAll', auth, validateQuery(getAllFavoritesSchema), getAllFavorites);
router.get('/getByAuth', auth, validateQuery(getFavoritesByAuthSchema), getFavoritesByAuthUser);
router.get('/getById/:id', auth, validateParams(getFavoriteByIdSchema), getFavoriteById);
router.put('/update/:id', auth, validateParams(getFavoriteByIdSchema), validateBody(updateFavoriteSchema), updateFavorite);
router.delete('/delete/:id', auth, validateParams(getFavoriteByIdSchema), deleteFavorite);

module.exports = router;

