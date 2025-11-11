const Joi = require('joi');

/**
 * User validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),

  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters'
    }),

  address: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 10 characters long',
      'string.max': 'Address cannot exceed 500 characters'
    }),

  country_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Country ID must be a number',
      'number.empty': 'Country ID is required',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    }),

  state_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'State ID must be a number',
      'number.empty': 'State ID is required',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
    }),

  city_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'string.empty': 'City ID is required',
      'number.base': 'City ID must be a number',
      'number.integer': 'City ID must be an integer',
      'number.positive': 'City ID must be a positive number'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create user validation schema
const createUserSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
  dob: Joi.date()
    .required()
    .max('now')
    .messages({
      'date.base': 'Date of birth must be a valid date',
      'date.empty': 'Date of birth is required',
      'date.max': 'Date of birth cannot be in the future'
    }),
  isAgreeTermsConditions: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Terms and conditions agreement must be a boolean value'
    }),
  role_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Role ID must be a number',
      'number.integer': 'Role ID must be an integer',
      'number.positive': 'Role ID must be a positive number'
    }),
  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  Islogin_permissions: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Islogin_permissions must be a boolean value'
    }),
  Permissions_DeviceLocation: Joi.boolean()
    .default(false)
    .optional()
    .messages({
      'boolean.base': 'Permissions_DeviceLocation must be a boolean value'
    }),
  Bio: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Bio cannot exceed 500 characters'
    }),
  Email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
  hobby: Joi.array()
    .items(Joi.string().trim().max(100))
    .optional()
    .default([])
    .messages({
      'array.base': 'Hobby must be an array',
      'string.max': 'Each hobby cannot exceed 100 characters'
    }),
  personType: Joi.string()
    .valid('Family Person', 'Friends Person', 'Social Person')
    .optional()
    .allow('')
    .messages({
      'any.only': 'Person type must be one of: Family Person, Friends Person, Social Person'
    }),
  user_image: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'User image must be a valid URL'
    })
});

// Update user validation schema
const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
  dob: Joi.date()
    .optional()
    .max('now')
    .messages({
      'date.base': 'Date of birth must be a valid date',
      'date.max': 'Date of birth cannot be in the future'
    }),
  isAgreeTermsConditions: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Terms and conditions agreement must be a boolean value'
    }),
  role_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Role ID must be a number',
      'number.integer': 'Role ID must be an integer',
      'number.positive': 'Role ID must be a positive number'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  Islogin_permissions: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Islogin_permissions must be a boolean value'
    }),
  Permissions_DeviceLocation: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Permissions_DeviceLocation must be a boolean value'
    }),
  Bio: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Bio cannot exceed 500 characters'
    }),
  Email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
  hobby: Joi.array()
    .items(Joi.string().trim().max(100))
    .optional()
    .messages({
      'array.base': 'Hobby must be an array',
      'string.max': 'Each hobby cannot exceed 100 characters'
    }),
  personType: Joi.string()
    .valid('Family Person', 'Friends Person', 'Social Person')
    .optional()
    .allow('')
    .messages({
      'any.only': 'Person type must be one of: Family Person, Friends Person, Social Person'
    }),
  user_image: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'User image must be a valid URL'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

// User login validation schema (phone number only)
const userLoginSchema = Joi.object({
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    })
});

// Verify OTP validation schema
const verifyOTPSchema = Joi.object({
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
  otp: Joi.string()
    .pattern(/^[0-9]{4}$/)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.pattern.base': 'OTP must be a 4-digit number'
    })
});

const resendOTPSchema = Joi.object({
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  role: Joi.alternatives()
    .try(
      Joi.string().trim(),
      Joi.array().items(Joi.string().trim()).min(1)
    )
    .optional()
}).or('phoneNo', 'email').messages({
  'object.missing': 'Either phone number or email is required'
});

// Get user by ID validation schema
const getUserByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
      Joi.string().pattern(/^\d+$/), // Number as string (e.g., "1", "2")
      Joi.number().integer().positive() // Number directly
    )
    .required()
    .messages({
      'alternatives.match': 'User ID must be a valid ObjectId or positive number',
      'string.empty': 'User ID is required'
    })
});

// Get all users query validation schema
const getAllUsersSchema = Joi.object({
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
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  role_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Role ID must be a number',
      'number.integer': 'Role ID must be an integer',
      'number.positive': 'Role ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('firstName', 'lastName', 'created_at', 'updated_at', 'user_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: firstName, lastName, created_at, updated_at, user_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update user by ID with ID in body validation schema
const updateUserByIdBodySchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'User ID is required',
      'string.pattern.base': 'Please provide a valid user ID'
    }),
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
  dob: Joi.date()
    .optional()
    .max('now')
    .messages({
      'date.base': 'Date of birth must be a valid date',
      'date.max': 'Date of birth cannot be in the future'
    }),
  isAgreeTermsConditions: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Terms and conditions agreement must be a boolean value'
    }),
  role_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Role ID must be a number',
      'number.integer': 'Role ID must be an integer',
      'number.positive': 'Role ID must be a positive number'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  Islogin_permissions: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Islogin_permissions must be a boolean value'
    }),
  Permissions_DeviceLocation: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Permissions_DeviceLocation must be a boolean value'
    }),
  Bio: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Bio cannot exceed 500 characters'
    }),
  Email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
  hobby: Joi.array()
    .items(Joi.string().trim().max(100))
    .optional()
    .messages({
      'array.base': 'Hobby must be an array',
      'string.max': 'Each hobby cannot exceed 100 characters'
    }),
  personType: Joi.string()
    .valid('Family Person', 'Friends Person', 'Social Person')
    .optional()
    .allow('')
    .messages({
      'any.only': 'Person type must be one of: Family Person, Friends Person, Social Person'
    }),
  user_image: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'User image must be a valid URL'
    })
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required'
    }),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'string.empty': 'Confirm password is required',
      'any.only': 'Confirm password must match new password'
    })
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateUserByIdBodySchema,
  loginSchema,
  userLoginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  getUserByIdSchema,
  getAllUsersSchema,
  changePasswordSchema
};
