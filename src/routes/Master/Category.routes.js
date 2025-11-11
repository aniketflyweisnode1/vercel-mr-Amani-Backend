const express = require('express');
const router = express.Router();

// Import controllers
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../../controllers/category.controller.js');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createCategorySchema, updateCategorySchema, getCategoryByIdSchema, getAllCategoriesSchema } = require('../../../validators/category.validator');

// Routes
router.post('/create', auth, validateBody(createCategorySchema), createCategory);
router.get('/getAll', validateQuery(getAllCategoriesSchema), getAllCategories);
router.get('/getById/:id', auth, validateParams(getCategoryByIdSchema), getCategoryById);
router.put('/update/:id', auth, validateParams(getCategoryByIdSchema), validateBody(updateCategorySchema), updateCategory);
router.delete('/delete/:id', auth, validateParams(getCategoryByIdSchema), deleteCategory);

module.exports = router;

