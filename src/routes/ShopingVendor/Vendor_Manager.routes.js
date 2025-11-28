const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createWorkForceEmployee,
  getAllWorkForceEmployees,
  getWorkForceEmployeeById,
  updateWorkForceEmployee,
  deleteWorkForceEmployee,
  getWorkForceEmployeesByAuth
} = require('../../controllers/WorkForceManagement_Employee.controller');
const {
  createWorkForceEmployeeSchema,
  updateWorkForceEmployeeSchema,
  getWorkForceEmployeeByIdSchema,
  getAllWorkForceEmployeesSchema,
  getWorkForceEmployeesByAuthSchema
} = require('../../../validators/WorkForceManagement_Employee.validator');

router.post('/create', auth, validateBody(createWorkForceEmployeeSchema), createWorkForceEmployee);
router.get('/getAll', validateQuery(getAllWorkForceEmployeesSchema), getAllWorkForceEmployees);
router.get('/getById/:id', auth, validateParams(getWorkForceEmployeeByIdSchema), getWorkForceEmployeeById);
router.put('/update/:id', auth, validateParams(getWorkForceEmployeeByIdSchema), validateBody(updateWorkForceEmployeeSchema), updateWorkForceEmployee);
router.delete('/delete/:id', auth, validateParams(getWorkForceEmployeeByIdSchema), deleteWorkForceEmployee);
router.get('/getByAuth', auth, validateQuery(getWorkForceEmployeesByAuthSchema), getWorkForceEmployeesByAuth);

module.exports = router;

