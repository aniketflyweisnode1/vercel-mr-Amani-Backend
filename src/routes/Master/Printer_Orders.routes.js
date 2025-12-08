const express = require('express');
const router = express.Router();

const { createPrinterOrder, getAllPrinterOrders, getPrinterOrderById, updatePrinterOrder, deletePrinterOrder } = require('../../controllers/Printer_Orders.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createPrinterOrderSchema, updatePrinterOrderSchema, getPrinterOrderByIdSchema, getAllPrinterOrdersSchema } = require('../../../validators/Printer_Orders.validator');

router.post('/create', auth, validateBody(createPrinterOrderSchema), createPrinterOrder);
router.get('/getAll', validateQuery(getAllPrinterOrdersSchema), getAllPrinterOrders);
router.get('/getById/:id', auth, validateParams(getPrinterOrderByIdSchema), getPrinterOrderById);
router.put('/update/:id', auth, validateParams(getPrinterOrderByIdSchema), validateBody(updatePrinterOrderSchema), updatePrinterOrder);
router.delete('/delete/:id', auth, validateParams(getPrinterOrderByIdSchema), deletePrinterOrder);

module.exports = router;
