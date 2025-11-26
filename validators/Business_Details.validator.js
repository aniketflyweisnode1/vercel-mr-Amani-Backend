const Joi = require('joi');

const createBusinessDetailsSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  Branches_count: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  Employees_count: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  Days_open_count: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  google_office_address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  office_address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  StreetNo: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow(''),
  Streetname: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow(''),
  City: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),
  country: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),
  state: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),
  zipcode: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow(''),
  BussinessName: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow(''),
  BusinessType_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  EmployeeIds_file: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  foodServiceLicense_file: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  Service: Joi.object({
    AllneedaEats: Joi.boolean().optional().default(false),
    Website: Joi.boolean().optional().default(false)
  }).optional().default({ AllneedaEats: false, Website: false }),
  IIIrdParty: Joi.object({
    uberEats: Joi.boolean().optional().default(false),
    DoorDash: Joi.boolean().optional().default(false),
    GrubHub: Joi.boolean().optional().default(false)
  }).optional().default({ uberEats: false, DoorDash: false, GrubHub: false }),
  mobileapp: Joi.boolean()
    .optional()
    .default(false),
  Tablet: Joi.boolean()
    .optional()
    .default(false),
  subscription_Id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  emozi: Joi.string()
    .trim()
    .optional()
    .allow(''),
  Status: Joi.boolean()
    .default(true)
    .optional()
});

const updateBusinessDetailsSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  Branches_count: Joi.number()
    .integer()
    .min(0)
    .optional(),
  Employees_count: Joi.number()
    .integer()
    .min(0)
    .optional(),
  Days_open_count: Joi.number()
    .integer()
    .min(0)
    .optional(),
  google_office_address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  office_address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  StreetNo: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow(''),
  Streetname: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow(''),
  City: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),
  country: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),
  state: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),
  zipcode: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow(''),
  BussinessName: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow(''),
  BusinessType_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  EmployeeIds_file: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  foodServiceLicense_file: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  Service: Joi.object({
    AllneedaEats: Joi.boolean().optional(),
    Website: Joi.boolean().optional()
  }).optional(),
  IIIrdParty: Joi.object({
    uberEats: Joi.boolean().optional(),
    DoorDash: Joi.boolean().optional(),
    GrubHub: Joi.boolean().optional()
  }).optional(),
  mobileapp: Joi.boolean()
    .optional(),
  Tablet: Joi.boolean()
    .optional(),
  subscription_Id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  emozi: Joi.string()
    .trim()
    .optional()
    .allow(''),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getBusinessDetailsByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Business Details ID must be a valid ObjectId or positive number',
      'string.empty': 'Business Details ID is required'
    })
});

const getAllBusinessDetailsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  search: Joi.string()
    .trim()
    .optional()
    .allow(''),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  BusinessType_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'BussinessName')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

const getBusinessDetailsByAuthSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'BussinessName')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createBusinessDetailsSchema,
  updateBusinessDetailsSchema,
  getBusinessDetailsByIdSchema,
  getAllBusinessDetailsSchema,
  getBusinessDetailsByAuthSchema
};
