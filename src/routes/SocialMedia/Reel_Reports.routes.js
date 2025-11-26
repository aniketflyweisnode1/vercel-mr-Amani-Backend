const express = require('express');
const router = express.Router();

const { createReelReports, getAllReelReports, getReelReportsById, updateReelReports, deleteReelReports, getReelReportsByAuth, getReelReportsByReelId } = require('../../controllers/Reel_Reports.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createReelReportsSchema, updateReelReportsSchema, getReelReportsByIdSchema, getAllReelReportsSchema, getReelReportsByAuthSchema, getReelReportsByReelIdParamsSchema, getReelReportsByReelIdQuerySchema } = require('../../../validators/Reel_Reports.validator');

router.post('/create', auth, validateBody(createReelReportsSchema), createReelReports);
router.get('/getAll', validateQuery(getAllReelReportsSchema), getAllReelReports);
router.get('/getById/:id', auth, validateParams(getReelReportsByIdSchema), getReelReportsById);
router.put('/update/:id', auth, validateParams(getReelReportsByIdSchema), validateBody(updateReelReportsSchema), updateReelReports);
router.delete('/delete/:id', auth, validateParams(getReelReportsByIdSchema), deleteReelReports);
router.get('/getByAuth', auth, validateQuery(getReelReportsByAuthSchema), getReelReportsByAuth);
router.get('/getByReelId/:reelId', validateParams(getReelReportsByReelIdParamsSchema), validateQuery(getReelReportsByReelIdQuerySchema), getReelReportsByReelId);

module.exports = router;

