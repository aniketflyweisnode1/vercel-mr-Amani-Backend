const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorFlashSale,
  getAllVendorFlashSales,
  getVendorFlashSaleById,
  updateVendorFlashSale,
  deleteVendorFlashSale,
  getVendorFlashSalesByProductId,
  getVendorFlashSalesByAuth
} = require('../../controllers/Vendor_Flash_sale.controller');
const {
  createVendorFlashSaleSchema,
  updateVendorFlashSaleSchema,
  getVendorFlashSaleByIdSchema,
  getAllVendorFlashSalesSchema,
  getVendorFlashSalesByProductIdParamsSchema,
  getVendorFlashSalesByProductIdQuerySchema,
  getVendorFlashSalesByAuthSchema
} = require('../../../validators/Vendor_Flash_sale.validator');

router.post('/create', auth, validateBody(createVendorFlashSaleSchema), createVendorFlashSale);
router.get('/getAll', validateQuery(getAllVendorFlashSalesSchema), getAllVendorFlashSales);
router.get('/getById/:id', auth, validateParams(getVendorFlashSaleByIdSchema), getVendorFlashSaleById);
router.put('/update/:id', auth, validateParams(getVendorFlashSaleByIdSchema), validateBody(updateVendorFlashSaleSchema), updateVendorFlashSale);
router.delete('/delete/:id', auth, validateParams(getVendorFlashSaleByIdSchema), deleteVendorFlashSale);
router.get('/getByProductId/:Vendor_Product_id', validateParams(getVendorFlashSalesByProductIdParamsSchema), validateQuery(getVendorFlashSalesByProductIdQuerySchema), getVendorFlashSalesByProductId);
router.get('/getByAuth', auth, validateQuery(getVendorFlashSalesByAuthSchema), getVendorFlashSalesByAuth);

module.exports = router;
