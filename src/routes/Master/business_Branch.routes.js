const express = require('express');
const router = express.Router();

const { createBusinessBranch, getAllBusinessBranches, getBusinessBranchById, updateBusinessBranch, deleteBusinessBranch, getBusinessBranchesByAuth } = require('../../controllers/business_Branch.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createBusinessBranchSchema, updateBusinessBranchSchema, getBusinessBranchByIdSchema, getAllBusinessBranchesSchema, getBusinessBranchesByAuthSchema } = require('../../../validators/business_Branch.validator');

router.post('/create', auth, validateBody(createBusinessBranchSchema), createBusinessBranch);
router.get('/getAll', validateQuery(getAllBusinessBranchesSchema), getAllBusinessBranches);
router.get('/getById/:id', auth, validateParams(getBusinessBranchByIdSchema), getBusinessBranchById);
router.put('/update/:id', auth, validateParams(getBusinessBranchByIdSchema), validateBody(updateBusinessBranchSchema), updateBusinessBranch);
router.delete('/delete/:id', auth, validateParams(getBusinessBranchByIdSchema), deleteBusinessBranch);
router.get('/getByAuth', auth, validateQuery(getBusinessBranchesByAuthSchema), getBusinessBranchesByAuth);

module.exports = router;

