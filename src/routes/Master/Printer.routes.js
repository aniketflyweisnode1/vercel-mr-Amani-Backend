const express = require('express');
const router = express.Router();

const { createPrinter, getAllPrinters, getPrinterById, updatePrinter, deletePrinter, getPrintersByTypeId, getPrintersByAuth, getPrinterDashboard } = require('../../controllers/Printer.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createPrinterSchema, updatePrinterSchema, getPrinterByIdSchema, getAllPrintersSchema, getPrintersByTypeIdParamsSchema, getPrintersByTypeIdQuerySchema, getPrintersByAuthSchema, getPrinterDashboardSchema } = require('../../../validators/Printer.validator');

router.post('/create', auth, validateBody(createPrinterSchema), createPrinter);
router.get('/getAll', validateQuery(getAllPrintersSchema), getAllPrinters);
router.get('/getById/:id', auth, validateParams(getPrinterByIdSchema), getPrinterById);
router.put('/update/:id', auth, validateParams(getPrinterByIdSchema), validateBody(updatePrinterSchema), updatePrinter);
router.delete('/delete/:id', auth, validateParams(getPrinterByIdSchema), deletePrinter);
router.get('/getByTypeId/:type_id', auth, validateParams(getPrintersByTypeIdParamsSchema), validateQuery(getPrintersByTypeIdQuerySchema), getPrintersByTypeId);
router.get('/getByAuth', auth, validateQuery(getPrintersByAuthSchema), getPrintersByAuth);
router.get('/getPrinterDashboard', auth, validateQuery(getPrinterDashboardSchema), getPrinterDashboard);

module.exports = router;
