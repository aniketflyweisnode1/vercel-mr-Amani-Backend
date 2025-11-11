const express = require('express');
const router = express.Router();

// Import controllers
const { createService, getAllServices, getServiceById, updateService, deleteService } = require('../../controllers/services.controller.js');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createServiceSchema, updateServiceSchema, getServiceByIdSchema, getAllServicesSchema } = require('../../../validators/services.validator');
    
// Routes
router.post('/create', auth, validateBody(createServiceSchema), createService);
router.get('/getAll', validateQuery(getAllServicesSchema), getAllServices);
router.get('/getById/:id', auth, validateParams(getServiceByIdSchema), getServiceById);
router.put('/update/:id', auth, validateParams(getServiceByIdSchema), validateBody(updateServiceSchema), updateService);
router.delete('/delete/:id', auth, validateParams(getServiceByIdSchema), deleteService);

module.exports = router;

