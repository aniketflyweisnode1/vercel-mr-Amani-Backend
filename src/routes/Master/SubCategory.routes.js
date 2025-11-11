const express = require('express');
const router = express.Router();

// Import controllers
const { createSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory, deleteSubCategory, getSubCategoriesByCategoryId } = require('../../controllers/subcategory.controller');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createSubCategorySchema, updateSubCategorySchema, getSubCategoryByIdSchema, getAllSubCategoriesSchema, getSubCategoriesByCategoryIdSchema } = require('../../../validators/subcategory.validator');

// Routes
router.post('/create', auth, validateBody(createSubCategorySchema), createSubCategory);
router.get('/getAll', validateQuery(getAllSubCategoriesSchema), getAllSubCategories);
router.get('/getById/:id', auth, validateParams(getSubCategoryByIdSchema), getSubCategoryById);
router.put('/update/:id', auth, validateParams(getSubCategoryByIdSchema), validateBody(updateSubCategorySchema), updateSubCategory);
router.delete('/delete/:id', auth, validateParams(getSubCategoryByIdSchema), deleteSubCategory);
router.get('/getByCategoryId/:category_id', auth, validateParams(getSubCategoriesByCategoryIdSchema), validateQuery(getSubCategoriesByCategoryIdSchema), getSubCategoriesByCategoryId);

module.exports = router;

