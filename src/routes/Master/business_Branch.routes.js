const express = require('express');
const router = express.Router();

const { createBusinessBranch, getAllBusinessBranches, getBusinessBranchById, updateBusinessBranch, deleteBusinessBranch, getBusinessBranchesByAuth, getBranchTrackRanksCompetitors } = require('../../controllers/business_Branch.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createBusinessBranchSchema, updateBusinessBranchSchema, getBusinessBranchByIdSchema, getAllBusinessBranchesSchema, getBusinessBranchesByAuthSchema, getBranchTrackRanksCompetitorsSchema } = require('../../../validators/business_Branch.validator');

router.post('/create', auth, validateBody(createBusinessBranchSchema), createBusinessBranch);
router.get('/getAll', validateQuery(getAllBusinessBranchesSchema), getAllBusinessBranches);
router.get('/getById/:id', auth, validateParams(getBusinessBranchByIdSchema), getBusinessBranchById);
router.put('/update/:id', auth, validateParams(getBusinessBranchByIdSchema), validateBody(updateBusinessBranchSchema), updateBusinessBranch);
router.delete('/delete/:id', auth, validateParams(getBusinessBranchByIdSchema), deleteBusinessBranch);
router.get('/getByAuth', auth, validateQuery(getBusinessBranchesByAuthSchema), getBusinessBranchesByAuth);
router.get('/getBranchTrackRanksCompetitors', auth, validateQuery(getBranchTrackRanksCompetitorsSchema), getBranchTrackRanksCompetitors);

module.exports = router;

