const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  // Check if schema is valid
  if (!schema) {
    return next();
  }

  // Validate request body against schema
  const { value, error } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true, // Remove unknown fields
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');

    return res.status(400).json({
      success: false,
      message: errorMessage,
      errors: error.details,
    });
  }

  // Replace req.body with validated value (coerced types, stripped fields, etc.)
  Object.assign(req, { body: value });

  next();
};

module.exports = {
  validate,
  validateObjectId: (paramName) => (req, res, next) => {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
      });
    }
    next();
  },
};
