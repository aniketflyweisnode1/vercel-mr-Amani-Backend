const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');
const {
  createMyFavorites,
  getAllMyFavorites,
  getMyFavoritesById,
  updateMyFavorites,
  deleteMyFavorites,
  getMyFavoritesByAuth
} = require('../../../controllers/MyFavorites.controller');
const {
  createMyFavoritesSchema,
  updateMyFavoritesSchema,
  getMyFavoritesByIdSchema,
  getAllMyFavoritesSchema,
  getMyFavoritesByAuthSchema
} = require('../../../../validators/MyFavorites.validator');

router.post('/create', auth, validateBody(createMyFavoritesSchema), createMyFavorites);
router.get('/getAll', validateQuery(getAllMyFavoritesSchema), getAllMyFavorites);
router.get('/getById/:id', auth, validateParams(getMyFavoritesByIdSchema), getMyFavoritesById);
router.put('/update/:id', auth, validateParams(getMyFavoritesByIdSchema), validateBody(updateMyFavoritesSchema), updateMyFavorites);
router.delete('/delete/:id', auth, validateParams(getMyFavoritesByIdSchema), deleteMyFavorites);
router.get('/getByAuth', auth, validateQuery(getMyFavoritesByAuthSchema), getMyFavoritesByAuth);

module.exports = router;

