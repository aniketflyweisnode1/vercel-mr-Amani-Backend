const express = require('express');
const router = express.Router();

const { createBusinessDetails, getAllBusinessDetails, getBusinessDetailsById, updateBusinessDetails, deleteBusinessDetails, getBusinessDetailsByAuth } = require('../../controllers/Business_Details.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createBusinessDetailsSchema, updateBusinessDetailsSchema, getBusinessDetailsByIdSchema, getAllBusinessDetailsSchema, getBusinessDetailsByAuthSchema } = require('../../../validators/Business_Details.validator');

router.post('/create', auth, validateBody(createBusinessDetailsSchema), createBusinessDetails);
router.get('/getAll', validateQuery(getAllBusinessDetailsSchema), getAllBusinessDetails);
router.get('/getById/:id', auth, validateParams(getBusinessDetailsByIdSchema), getBusinessDetailsById);
router.put('/update/:id', auth, validateParams(getBusinessDetailsByIdSchema), validateBody(updateBusinessDetailsSchema), updateBusinessDetails);
router.delete('/delete/:id', auth, validateParams(getBusinessDetailsByIdSchema), deleteBusinessDetails);
router.get('/getByAuth', auth, validateQuery(getBusinessDetailsByAuthSchema), getBusinessDetailsByAuth);

module.exports = router;

