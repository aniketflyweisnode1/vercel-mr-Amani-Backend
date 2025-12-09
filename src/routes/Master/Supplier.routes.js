const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSuppliersByAuth
} = require('../../controllers/Supplier.controller');
const {
  createSupplierSchema,
  updateSupplierSchema,
  getSupplierByIdSchema,
  getAllSuppliersSchema,
  getSuppliersByAuthSchema
} = require('../../../validators/Supplier.validator');

router.post('/create', auth, validateBody(createSupplierSchema), createSupplier);
router.get('/getAll', validateQuery(getAllSuppliersSchema), getAllSuppliers);
router.get('/getById/:id', auth, validateParams(getSupplierByIdSchema), getSupplierById);
router.put('/update/:id', auth, validateParams(getSupplierByIdSchema), validateBody(updateSupplierSchema), updateSupplier);
router.delete('/delete/:id', auth, validateParams(getSupplierByIdSchema), deleteSupplier);
router.get('/getByAuth', auth, validateQuery(getSuppliersByAuthSchema), getSuppliersByAuth);

module.exports = router;
