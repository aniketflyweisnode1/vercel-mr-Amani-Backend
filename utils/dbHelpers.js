/**
 * Database helper utilities for safe ID lookups and error handling
 */

/**
 * Safely find a document by ID (MongoDB ObjectId or numeric ID)
 * @param {Object} Model - Mongoose model
 * @param {string|number} identifier - ID to search for
 * @param {Object} options - Additional options
 * @param {string} options.numericIdField - Field name for numeric ID (default: model name + '_id')
 * @returns {Promise<Object|null>} Document or null if not found
 */
const safeFindById = async (Model, identifier, options = {}) => {
  if (!identifier) return null;

  try {
    let document;

    // Check if it's a MongoDB ObjectId (24 hex characters)
    if (typeof identifier === 'string' && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      document = await Model.findById(identifier);
    } else {
      // Try numeric ID
      const numericId = typeof identifier === 'number' ? identifier : parseInt(identifier, 10);
      
      if (Number.isNaN(numericId)) {
        return null; // Invalid ID format
      }

      // Determine numeric ID field name
      const modelName = Model.modelName;
      const numericIdField = options.numericIdField || `${modelName.replace(/([A-Z])/g, '_$1').toLowerCase()}_id`;
      
      // Try common field name patterns
      const possibleFields = [
        numericIdField,
        `${modelName}_id`,
        `${modelName.replace('_', '')}_id`,
        'id'
      ];

      // Try each possible field
      for (const field of possibleFields) {
        try {
          document = await Model.findOne({ [field]: numericId });
          if (document) break;
        } catch (err) {
          // Field doesn't exist, try next
          continue;
        }
      }
    }

    return document || null;
  } catch (error) {
    // Handle CastError and other MongoDB errors
    if (error.name === 'CastError') {
      return null;
    }
    throw error;
  }
};

/**
 * Safely find and update a document by ID
 * @param {Object} Model - Mongoose model
 * @param {string|number} identifier - ID to search for
 * @param {Object} updateData - Data to update
 * @param {Object} options - Mongoose options (new, runValidators, etc.)
 * @param {string} options.numericIdField - Field name for numeric ID
 * @returns {Promise<Object|null>} Updated document or null if not found
 */
const safeFindByIdAndUpdate = async (Model, identifier, updateData, options = {}) => {
  if (!identifier) return null;

  try {
    let document;
    const mongooseOptions = { new: true, runValidators: true, ...options };
    delete mongooseOptions.numericIdField;

    // Check if it's a MongoDB ObjectId
    if (typeof identifier === 'string' && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      document = await Model.findByIdAndUpdate(identifier, updateData, mongooseOptions);
    } else {
      // Try numeric ID
      const numericId = typeof identifier === 'number' ? identifier : parseInt(identifier, 10);
      
      if (Number.isNaN(numericId)) {
        return null;
      }

      // Determine numeric ID field name
      const modelName = Model.modelName;
      const numericIdField = options.numericIdField || `${modelName.replace(/([A-Z])/g, '_$1').toLowerCase()}_id`;
      
      const possibleFields = [
        numericIdField,
        `${modelName}_id`,
        `${modelName.replace('_', '')}_id`
      ];

      for (const field of possibleFields) {
        try {
          document = await Model.findOneAndUpdate(
            { [field]: numericId },
            updateData,
            mongooseOptions
          );
          if (document) break;
        } catch (err) {
          if (err.name === 'CastError') {
            continue;
          }
          throw err;
        }
      }
    }

    return document || null;
  } catch (error) {
    if (error.name === 'CastError') {
      return null;
    }
    throw error;
  }
};

/**
 * Validate ID format
 * @param {string|number} id - ID to validate
 * @returns {Object} Validation result with isValid flag and type
 */
const validateId = (id) => {
  if (!id) {
    return { isValid: false, type: null, message: 'ID is required' };
  }

  // Check if it's a MongoDB ObjectId
  if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
    return { isValid: true, type: 'ObjectId', parsed: id };
  }

  // Check if it's a numeric ID
  const numericId = typeof id === 'number' ? id : parseInt(id, 10);
  if (!Number.isNaN(numericId) && numericId > 0) {
    return { isValid: true, type: 'numeric', parsed: numericId };
  }

  return { isValid: false, type: null, message: 'Invalid ID format' };
};

module.exports = {
  safeFindById,
  safeFindByIdAndUpdate,
  validateId
};
