const express = require('express');
const router = express.Router();

const { createPrinterIssue, getAllPrinterIssues, getPrinterIssueById, updatePrinterIssue, deletePrinterIssue } = require('../../controllers/Printer_Issues.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createPrinterIssueSchema, updatePrinterIssueSchema, getPrinterIssueByIdSchema, getAllPrinterIssuesSchema } = require('../../../validators/Printer_Issues.validator');

router.post('/create', auth, validateBody(createPrinterIssueSchema), createPrinterIssue);
router.get('/getAll', validateQuery(getAllPrinterIssuesSchema), getAllPrinterIssues);
router.get('/getById/:id', auth, validateParams(getPrinterIssueByIdSchema), getPrinterIssueById);
router.put('/update/:id', auth, validateParams(getPrinterIssueByIdSchema), validateBody(updatePrinterIssueSchema), updatePrinterIssue);
router.delete('/delete/:id', auth, validateParams(getPrinterIssueByIdSchema), deletePrinterIssue);

module.exports = router;
