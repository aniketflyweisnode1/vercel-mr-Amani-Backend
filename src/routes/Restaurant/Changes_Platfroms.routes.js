const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createChangesPlatfromsSchema, updateChangesPlatfromsSchema, getChangesPlatfromsByIdSchema, getAllChangesPlatfromsSchema, getChangesPlatfromsByBranchIdParamsSchema, getChangesPlatfromsByBranchIdQuerySchema, getChangesPlatfromsByAuthSchema } = require('../../../validators/Changes_Platfroms.validator');
const { createChangesPlatfroms, getAllChangesPlatfroms, getChangesPlatfromsById, updateChangesPlatfroms, deleteChangesPlatfroms, getChangesPlatfromsByBranchId, getChangesPlatfromsByAuth } = require('../../controllers/Changes_Platfroms.controller');

router.post('/create', auth, validateBody(createChangesPlatfromsSchema), createChangesPlatfroms);
router.get('/getAll', validateQuery(getAllChangesPlatfromsSchema), getAllChangesPlatfroms);
router.get('/getById/:id', auth, validateParams(getChangesPlatfromsByIdSchema), getChangesPlatfromsById);
router.put('/update/:id', auth, validateParams(getChangesPlatfromsByIdSchema), validateBody(updateChangesPlatfromsSchema), updateChangesPlatfroms);
router.delete('/delete/:id', auth, validateParams(getChangesPlatfromsByIdSchema), deleteChangesPlatfroms);
router.get('/getByBranchId/:Branch_id', auth, validateParams(getChangesPlatfromsByBranchIdParamsSchema), validateQuery(getChangesPlatfromsByBranchIdQuerySchema), getChangesPlatfromsByBranchId);
router.get('/getByAuth', auth, validateQuery(getChangesPlatfromsByAuthSchema), getChangesPlatfromsByAuth);

module.exports = router;
