const Joi = require('joi');

const createCateringEventSchema = Joi.object({
  Catering_Eventtype_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Event Type ID must be a number',
      'number.integer': 'Catering Event Type ID must be an integer',
      'number.positive': 'Catering Event Type ID must be a positive number',
      'any.required': 'Catering Event Type ID is required'
    }),
  EventName: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Event name must be a string',
      'string.max': 'Event name cannot exceed 200 characters'
    }),
  userName: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.base': 'User name must be a string',
      'string.max': 'User name cannot exceed 200 characters'
    }),
  address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Address must be a string',
      'string.max': 'Address cannot exceed 500 characters'
    }),
  DateTime: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Date and time must be a valid date',
      'date.format': 'Date and time must be in ISO format',
      'any.required': 'Date and time is required'
    }),
  DeliveryDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Delivery date must be a valid date',
      'date.format': 'Delivery date must be in ISO format',
      'any.required': 'Delivery date is required'
    }),
  DeliveryTime: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Delivery time must be a string',
      'string.max': 'Delivery time cannot exceed 50 characters'
    }),
  NumberOfGuests: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Number of guests must be a number',
      'number.integer': 'Number of guests must be an integer',
      'number.min': 'Number of guests must be at least 1',
      'any.required': 'Number of guests is required'
    }),
  CuisinePreference: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Cuisine preference must be a string',
      'string.max': 'Cuisine preference cannot exceed 200 characters'
    }),
  BudgetPerPerson: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Budget per person must be a number',
      'number.min': 'Budget per person cannot be negative'
    }),
  SpecialInstructions: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Special instructions must be a string',
      'string.max': 'Special instructions cannot exceed 1000 characters'
    }),
  EventMode: Joi.string()
    .valid('Catering', 'Vending')
    .optional()
    .messages({
      'any.only': 'EventMode must be either Catering or Vending'
    }),
  Receive: Joi.string()
    .valid('Pickup', 'Delivery')
    .optional()
    .messages({
      'any.only': 'Receive must be either Pickup or Delivery'
    }),
  website: Joi.string()
    .trim()
    .uri()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Website must be a string',
      'string.uri': 'Website must be a valid URL',
      'string.max': 'Website cannot exceed 500 characters'
    }),
  Occasion: Joi.array()
    .items(Joi.object({
      type: Joi.string()
        .trim()
        .max(200)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Occasion type cannot exceed 200 characters'
        }),
      status: Joi.boolean()
        .default(false)
        .messages({
          'boolean.base': 'Status must be a boolean value'
        })
    }))
    .optional()
    .default([])
    .messages({
      'array.base': 'Occasion must be an array'
    }),
  CuisineSelection: Joi.array()
    .items(Joi.object({
      type: Joi.string()
        .trim()
        .max(200)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Cuisine type cannot exceed 200 characters'
        }),
      status: Joi.boolean()
        .default(false)
        .messages({
          'boolean.base': 'Status must be a boolean value'
        })
    }))
    .optional()
    .default([])
    .messages({
      'array.base': 'CuisineSelection must be an array'
    }),
  Days: Joi.array()
    .items(Joi.object({
      Day: Joi.string()
        .trim()
        .max(50)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Day cannot exceed 50 characters'
        }),
      StartDate: Joi.date()
        .iso()
        .optional()
        .messages({
          'date.base': 'StartDate must be a valid date',
          'date.format': 'StartDate must be in ISO format'
        }),
      EndDate: Joi.date()
        .iso()
        .optional()
        .messages({
          'date.base': 'EndDate must be a valid date',
          'date.format': 'EndDate must be in ISO format'
        }),
      StartTime: Joi.string()
        .trim()
        .max(50)
        .optional()
        .allow('')
        .messages({
          'string.max': 'StartTime cannot exceed 50 characters'
        }),
      EndTime: Joi.string()
        .trim()
        .max(50)
        .optional()
        .allow('')
        .messages({
          'string.max': 'EndTime cannot exceed 50 characters'
        })
    }))
    .optional()
    .default([])
    .messages({
      'array.base': 'Days must be an array'
    }),
  city: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'City ID must be a number',
      'number.integer': 'City ID must be an integer',
      'number.positive': 'City ID must be a positive number'
    }),
  state: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
    }),
  zip: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Zip code cannot exceed 20 characters'
    }),
  country: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Country ID must be a number',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    }),
  minimumGuarante: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Minimum guarantee must be a number',
      'number.min': 'Minimum guarantee cannot be negative'
    }),
  mobile: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Mobile number cannot exceed 20 characters'
    }),
  Email: Joi.string()
    .trim()
    .email()
    .lowercase()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email cannot exceed 200 characters'
    }),
  IsAgree: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      'boolean.base': 'IsAgree must be a boolean value'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateCateringEventSchema = Joi.object({
  Catering_Eventtype_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Catering Event Type ID must be a number',
      'number.integer': 'Catering Event Type ID must be an integer',
      'number.positive': 'Catering Event Type ID must be a positive number'
    }),
  EventName: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Event name must be a string',
      'string.max': 'Event name cannot exceed 200 characters'
    }),
  userName: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.base': 'User name must be a string',
      'string.max': 'User name cannot exceed 200 characters'
    }),
  address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Address must be a string',
      'string.max': 'Address cannot exceed 500 characters'
    }),
  DateTime: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Date and time must be a valid date',
      'date.format': 'Date and time must be in ISO format'
    }),
  DeliveryDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Delivery date must be a valid date',
      'date.format': 'Delivery date must be in ISO format'
    }),
  DeliveryTime: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Delivery time must be a string',
      'string.max': 'Delivery time cannot exceed 50 characters'
    }),
  NumberOfGuests: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Number of guests must be a number',
      'number.integer': 'Number of guests must be an integer',
      'number.min': 'Number of guests must be at least 1'
    }),
  CuisinePreference: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Cuisine preference must be a string',
      'string.max': 'Cuisine preference cannot exceed 200 characters'
    }),
  BudgetPerPerson: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Budget per person must be a number',
      'number.min': 'Budget per person cannot be negative'
    }),
  SpecialInstructions: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Special instructions must be a string',
      'string.max': 'Special instructions cannot exceed 1000 characters'
    }),
  EventMode: Joi.string()
    .valid('Catering', 'Vending')
    .optional()
    .messages({
      'any.only': 'EventMode must be either Catering or Vending'
    }),
  Receive: Joi.string()
    .valid('Pickup', 'Delivery')
    .optional()
    .messages({
      'any.only': 'Receive must be either Pickup or Delivery'
    }),
  website: Joi.string()
    .trim()
    .uri()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Website must be a string',
      'string.uri': 'Website must be a valid URL',
      'string.max': 'Website cannot exceed 500 characters'
    }),
  Occasion: Joi.array()
    .items(Joi.object({
      type: Joi.string()
        .trim()
        .max(200)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Occasion type cannot exceed 200 characters'
        }),
      status: Joi.boolean()
        .default(false)
        .messages({
          'boolean.base': 'Status must be a boolean value'
        })
    }))
    .optional()
    .messages({
      'array.base': 'Occasion must be an array'
    }),
  CuisineSelection: Joi.array()
    .items(Joi.object({
      type: Joi.string()
        .trim()
        .max(200)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Cuisine type cannot exceed 200 characters'
        }),
      status: Joi.boolean()
        .default(false)
        .messages({
          'boolean.base': 'Status must be a boolean value'
        })
    }))
    .optional()
    .messages({
      'array.base': 'CuisineSelection must be an array'
    }),
  Days: Joi.array()
    .items(Joi.object({
      Day: Joi.string()
        .trim()
        .max(50)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Day cannot exceed 50 characters'
        }),
      StartDate: Joi.date()
        .iso()
        .optional()
        .messages({
          'date.base': 'StartDate must be a valid date',
          'date.format': 'StartDate must be in ISO format'
        }),
      EndDate: Joi.date()
        .iso()
        .optional()
        .messages({
          'date.base': 'EndDate must be a valid date',
          'date.format': 'EndDate must be in ISO format'
        }),
      StartTime: Joi.string()
        .trim()
        .max(50)
        .optional()
        .allow('')
        .messages({
          'string.max': 'StartTime cannot exceed 50 characters'
        }),
      EndTime: Joi.string()
        .trim()
        .max(50)
        .optional()
        .allow('')
        .messages({
          'string.max': 'EndTime cannot exceed 50 characters'
        })
    }))
    .optional()
    .messages({
      'array.base': 'Days must be an array'
    }),
  city: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'City ID must be a number',
      'number.integer': 'City ID must be an integer',
      'number.positive': 'City ID must be a positive number'
    }),
  state: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
    }),
  zip: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Zip code cannot exceed 20 characters'
    }),
  country: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Country ID must be a number',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    }),
  minimumGuarante: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Minimum guarantee must be a number',
      'number.min': 'Minimum guarantee cannot be negative'
    }),
  mobile: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Mobile number cannot exceed 20 characters'
    }),
  Email: Joi.string()
    .trim()
    .email()
    .lowercase()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email cannot exceed 200 characters'
    }),
  IsAgree: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'IsAgree must be a boolean value'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1)
  .messages({
    'object.min': 'At least one field must be provided for update'
  });

const getCateringEventByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Event ID must be a valid ObjectId or positive number',
      'string.empty': 'Event ID is required'
    })
});

const getAllCateringEventsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 200 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  Catering_Eventtype_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Catering Event Type ID must be a number',
      'number.integer': 'Catering Event Type ID must be an integer',
      'number.positive': 'Catering Event Type ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('EventName', 'DateTime', 'DeliveryDate', 'created_at', 'updated_at', 'Catering_Event_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: EventName, DateTime, DeliveryDate, created_at, updated_at, Catering_Event_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const getCateringEventsByTypeIdParamsSchema = Joi.object({
  Catering_Eventtype_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Event Type ID must be a number',
      'number.integer': 'Catering Event Type ID must be an integer',
      'number.positive': 'Catering Event Type ID must be a positive number',
      'any.required': 'Catering Event Type ID is required'
    })
});

const getCateringEventsByTypeIdQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 200 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('EventName', 'DateTime', 'DeliveryDate', 'created_at', 'updated_at', 'Catering_Event_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: EventName, DateTime, DeliveryDate, created_at, updated_at, Catering_Event_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const getCateringEventsByAuthSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  Catering_Eventtype_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Catering Event Type ID must be a number',
      'number.integer': 'Catering Event Type ID must be an integer',
      'number.positive': 'Catering Event Type ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('EventName', 'DateTime', 'DeliveryDate', 'created_at', 'updated_at', 'Catering_Event_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: EventName, DateTime, DeliveryDate, created_at, updated_at, Catering_Event_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createCateringEventSchema,
  updateCateringEventSchema,
  getCateringEventByIdSchema,
  getAllCateringEventsSchema,
  getCateringEventsByTypeIdParamsSchema,
  getCateringEventsByTypeIdQuerySchema,
  getCateringEventsByAuthSchema
};

