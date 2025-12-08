const express = require('express');
const router = express.Router();

const { createPrinterType, getAllPrinterTypes, getPrinterTypeById, updatePrinterType, deletePrinterType, getPrinterTypesByAuth } = require('../../controllers/Printer_type.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createPrinterTypeSchema, updatePrinterTypeSchema, getPrinterTypeByIdSchema, getAllPrinterTypesSchema, getPrinterTypesByAuthSchema } = require('../../../validators/Printer_type.validator');

router.post('/create', auth, validateBody(createPrinterTypeSchema), createPrinterType);
router.get('/getAll', validateQuery(getAllPrinterTypesSchema), getAllPrinterTypes);
router.get('/getById/:id', auth, validateParams(getPrinterTypeByIdSchema), getPrinterTypeById);
router.put('/update/:id', auth, validateParams(getPrinterTypeByIdSchema), validateBody(updatePrinterTypeSchema), updatePrinterType);
router.delete('/delete/:id', auth, validateParams(getPrinterTypeByIdSchema), deletePrinterType);
router.get('/getByAuth', auth, validateQuery(getPrinterTypesByAuthSchema), getPrinterTypesByAuth);

module.exports = router;
