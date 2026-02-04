const Joi = require('joi');

const topicValidation = {
  // Topic creation/update validation
  createUpdate: Joi.object({
    topic_title: Joi.string().min(10).max(500).required().messages({
      'string.min': 'Tiêu đề ít nhất 10 ký tự',
      'string.max': 'Tiêu đề không quá 500 ký tự',
      'any.required': 'Tiêu đề là bắt buộc',
    }),
    topic_description: Joi.string().min(50).required().messages({
      'string.min': 'Mô tả ít nhất 50 ký tự',
      'any.required': 'Mô tả là bắt buộc',
    }),
    topic_category: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern': 'Danh mục không hợp lệ',
        'any.required': 'Danh mục là bắt buộc',
      }),
    topic_max_members: Joi.number().min(1).max(5).default(1),
    topic_advisor_request: Joi.string().max(1000),
  }),

  // Topic registration validation
  register: Joi.object({
    note: Joi.string().max(500).optional(),
  }),

  // Topic filter validation
  filter: Joi.object({
    search: Joi.string().max(100).optional(),
    category: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    instructor: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    sortBy: Joi.string()
      .valid('title', 'created_at', 'updated_at')
      .default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Progress update validation
  progress: Joi.object({
    milestone: Joi.string().required().messages({
      'any.required': 'Milestone là bắt buộc',
    }),
    status: Joi.string()
      .valid('pending', 'in_progress', 'completed', 'delayed')
      .required(),
    percentage: Joi.number().min(0).max(100),
    notes: Joi.string().max(1000),
    attachments: Joi.array().items(Joi.string()),
  }),
};

module.exports = topicValidation;
