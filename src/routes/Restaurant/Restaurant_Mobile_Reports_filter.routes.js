const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createReportsFilter,
  getAllReportsFilters,
  getReportsFilterById,
  updateReportsFilter,
  deleteReportsFilter,
  getReportsFiltersByAuth,
  getAllReportsFiltersByFilter
} = require('../../controllers/Restaurant_Mobile_Reports_filter.controller');
const {
  createReportsFilterSchema,
  updateReportsFilterSchema,
  getReportsFilterByIdSchema,
  getAllReportsFiltersSchema,
  getReportsFiltersByAuthSchema,
  getAllReportsFiltersByFilterSchema
} = require('../../../validators/Restaurant_Mobile_Reports_filter.validator');

router.post('/create', auth, validateBody(createReportsFilterSchema), createReportsFilter);
router.get('/getAll', validateQuery(getAllReportsFiltersSchema), getAllReportsFilters);
router.get('/getById/:id', auth, validateParams(getReportsFilterByIdSchema), getReportsFilterById);
router.put('/update/:id', auth, validateParams(getReportsFilterByIdSchema), validateBody(updateReportsFilterSchema), updateReportsFilter);
router.delete('/delete/:id', auth, validateParams(getReportsFilterByIdSchema), deleteReportsFilter);
router.get('/getAllByFilter', validateQuery(getAllReportsFiltersByFilterSchema), getAllReportsFiltersByFilter);
router.get('/getByAuth', auth, validateQuery(getReportsFiltersByAuthSchema), getReportsFiltersByAuth);

module.exports = router;

