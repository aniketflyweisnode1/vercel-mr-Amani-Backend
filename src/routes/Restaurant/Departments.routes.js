const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByAuth,
  getDepartmentsByTypeId
} = require('../../controllers/Departments.controller');
const {
  createDepartmentSchema,
  updateDepartmentSchema,
  getDepartmentByIdSchema,
  getAllDepartmentsSchema,
  getDepartmentsByAuthSchema,
  getDepartmentsByTypeIdParamsSchema
} = require('../../../validators/Departments.validator');

router.post('/create', auth, validateBody(createDepartmentSchema), createDepartment);
router.get('/getAll', validateQuery(getAllDepartmentsSchema), getAllDepartments);
router.get('/getById/:id', auth, validateParams(getDepartmentByIdSchema), getDepartmentById);
router.put('/update/:id', auth, validateParams(getDepartmentByIdSchema), validateBody(updateDepartmentSchema), updateDepartment);
router.delete('/delete/:id', auth, validateParams(getDepartmentByIdSchema), deleteDepartment);
router.get('/getByAuth', auth, validateQuery(getDepartmentsByAuthSchema), getDepartmentsByAuth);
router.get('/getByTypeId/:department_id', auth, validateParams(getDepartmentsByTypeIdParamsSchema), getDepartmentsByTypeId);

module.exports = router;



