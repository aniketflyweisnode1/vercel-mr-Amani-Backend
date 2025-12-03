const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const paginationBase = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Food_Truck_Catering_id', 'Name', 'StartDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createFoodTruckCateringSchema = Joi.object({
  Occasion: Joi.string().valid('Business', 'Personal').required(),
  Wedding: Joi.string().valid('Yes', 'No').default('No').optional(),
  Cuisine_Selection: Joi.array().items(Joi.string()).optional().default([]),
  FoodsTime: Joi.string().valid('Lunch', 'Breakfast', 'Dessert', 'Dinner').optional().allow(null),
  Dishes: Joi.string().valid('Main', 'Side', 'Drink', 'Dessert').optional().allow(null),
  GuestCount: Joi.number().integer().min(1).optional(),
  Foods: Joi.array().items(Joi.string()).optional().default([]),
  Dessert: Joi.array().items(Joi.string()).optional().default([]),
  Drinks: Joi.array().items(Joi.string()).optional().default([]),
  StartDate: Joi.date().iso().optional(),
  StartTime: Joi.string().trim().max(50).optional().allow(''),
  EndDate: Joi.date().iso().optional(),
  EndTime: Joi.string().trim().max(50).optional().allow(''),
  Address: Joi.string().trim().max(500).optional().allow(''),
  City: Joi.string().trim().max(100).optional().allow(''),
  State: Joi.string().trim().max(100).optional().allow(''),
  zip: Joi.string().trim().max(20).optional().allow(''),
  Country: Joi.string().trim().max(100).optional().allow(''),
  Name: Joi.string().trim().max(200).optional().allow(''),
  Email: Joi.string().trim().email().max(200).optional().allow(''),
  Phone: Joi.string().trim().max(20).optional().allow(''),
  Budget: Joi.number().min(0).optional(),
  IsAgree: Joi.boolean().optional().default(false),
  Status: Joi.boolean().optional().default(true)
});

const updateFoodTruckCateringSchema = Joi.object({
  Occasion: Joi.string().valid('Business', 'Personal').optional(),
  Wedding: Joi.string().valid('Yes', 'No').optional(),
  Cuisine_Selection: Joi.array().items(Joi.string()).optional(),
  FoodsTime: Joi.string().valid('Lunch', 'Breakfast', 'Dessert', 'Dinner').optional().allow(null),
  Dishes: Joi.string().valid('Main', 'Side', 'Drink', 'Dessert').optional().allow(null),
  GuestCount: Joi.number().integer().min(1).optional(),
  Foods: Joi.array().items(Joi.string()).optional(),
  Dessert: Joi.array().items(Joi.string()).optional(),
  Drinks: Joi.array().items(Joi.string()).optional(),
  StartDate: Joi.date().iso().optional(),
  StartTime: Joi.string().trim().max(50).optional().allow(''),
  EndDate: Joi.date().iso().optional(),
  EndTime: Joi.string().trim().max(50).optional().allow(''),
  Address: Joi.string().trim().max(500).optional().allow(''),
  City: Joi.string().trim().max(100).optional().allow(''),
  State: Joi.string().trim().max(100).optional().allow(''),
  zip: Joi.string().trim().max(20).optional().allow(''),
  Country: Joi.string().trim().max(100).optional().allow(''),
  Name: Joi.string().trim().max(200).optional().allow(''),
  Email: Joi.string().trim().email().max(200).optional().allow(''),
  Phone: Joi.string().trim().max(20).optional().allow(''),
  Budget: Joi.number().min(0).optional(),
  IsAgree: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getFoodTruckCateringByIdSchema = Joi.object({
  id: idSchema
});

const getAllFoodTruckCateringSchema = Joi.object({
  ...paginationBase,
  Occasion: Joi.string().valid('Business', 'Personal').optional()
});

const getFoodTruckCateringByAuthSchema = Joi.object({
  ...paginationBase,
  Occasion: Joi.string().valid('Business', 'Personal').optional()
});

module.exports = {
  createFoodTruckCateringSchema,
  updateFoodTruckCateringSchema,
  getFoodTruckCateringByIdSchema,
  getAllFoodTruckCateringSchema,
  getFoodTruckCateringByAuthSchema
};

