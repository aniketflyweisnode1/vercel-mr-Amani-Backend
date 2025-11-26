const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const { createSEOManagement, getAllSEOManagements, getSEOManagementById, updateSEOManagement, deleteSEOManagement, getSEOManagementsByAuth, getSEOManagementsByBranchId } = require('../../controllers/SEO_Management.controller'); 
const { createSEOManagementSchema, updateSEOManagementSchema, getSEOManagementByIdSchema, getAllSEOManagementSchema, getSEOManagementByAuthSchema, getSEOManagementByBranchParamsSchema } = require('../../../validators/SEO_Management.validator');

router.post('/create', auth, validateBody(createSEOManagementSchema), createSEOManagement);
router.get('/getAll', validateQuery(getAllSEOManagementSchema), getAllSEOManagements);
router.get('/getById/:id', auth, validateParams(getSEOManagementByIdSchema), getSEOManagementById);
router.put('/update/:id', auth, validateParams(getSEOManagementByIdSchema), validateBody(updateSEOManagementSchema), updateSEOManagement);
router.delete('/delete/:id', auth, validateParams(getSEOManagementByIdSchema), deleteSEOManagement);
router.get('/getByAuth', auth, validateQuery(getSEOManagementByAuthSchema), getSEOManagementsByAuth);
router.get('/getByBranchId/:business_Branch_id', auth, validateQuery(getAllSEOManagementSchema), validateParams(getSEOManagementByBranchParamsSchema), getSEOManagementsByBranchId);

module.exports = router;