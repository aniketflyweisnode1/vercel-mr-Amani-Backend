const { sendValidationError } = require('../utils/response');

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, query, params)
 * @returns {Function} Express middleware function
 */
const removeEmptyStrings = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  return Object.entries(data).reduce((acc, [key, value]) => {
    if (typeof value === 'string' && value.trim() === '') {
      return acc;
    }

    if (Array.isArray(value)) {
      acc[key] = value
        .map((item) => (typeof item === 'string' ? item.trim() : item))
        .filter((item) => !(typeof item === 'string' && item === ''));
      return acc;
    }

    acc[key] = value;
    return acc;
  }, Array.isArray(data) ? [] : {});
};

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    // Check if schema is defined
    if (!schema) {
      return sendValidationError(res, [{
        field: 'schema',
        message: 'Validation schema is missing',
        value: null
      }]);
    }

    const payload = removeEmptyStrings(req[property]);

    const { error, value } = schema.validate(payload, {
      abortEarly: false, // Show all validation errors
      stripUnknown: true, // Remove unknown fields
      allowUnknown: false // Don't allow unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return sendValidationError(res, errors);
    }

    // Replace the request property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

/**
 * Validate request body
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate request query parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate request parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateParams = (schema) => validate(schema, 'params');

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams
};
