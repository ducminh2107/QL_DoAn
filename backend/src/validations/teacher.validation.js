const Joi = require('joi');

const teacherValidation = {
  // Topic creation/update
  createTopic: Joi.object({
    topic_title: Joi.string().min(10).max(500).required(),
    topic_description: Joi.string().min(50).required(),
    topic_category: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    topic_major: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .allow('')
      .optional(),
    topic_registration_period: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .allow('')
      .optional(),
    topic_max_members: Joi.number().min(1).max(5).default(1),
    topic_advisor_request: Joi.string().max(1000).allow('').optional(),
  }),

  updateTopic: Joi.object({
    topic_title: Joi.string().min(10).max(500),
    topic_description: Joi.string().min(50),
    topic_category: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    topic_major: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .allow('')
      .optional(),
    topic_max_members: Joi.number().min(1).max(5),
    topic_advisor_request: Joi.string().max(1000).allow('').optional(),
    teacher_notes: Joi.string().max(2000).allow('').optional(),
  }),

  // Topic approval
  approveTopic: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required(),
    feedback: Joi.string().max(1000),
  }),

  // Student registration handling
  handleRegistration: Joi.object({
    action: Joi.string().valid('approve', 'reject').required(),
    feedback: Joi.string().max(500),
  }),

  // Grading
  submitGrades: Joi.object({
    type: Joi.string()
      .valid('instructor', 'reviewer', 'assembly')
      .default('instructor'),
    rubric_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    evaluations: Joi.array()
      .items(
        Joi.object({
          rubric_item_id: Joi.string().required(),
          criteria_name: Joi.string().required(),
          score: Joi.number().min(0).max(10).required(),
          comment: Joi.string().max(500).allow(''),
          max_score: Joi.number().default(10),
        })
      )
      .required(),
    comments: Joi.string().max(1000).allow(''),
    final_score: Joi.number().min(0).max(10),
  }),

  // Filter queries
  filterTopics: Joi.object({
    status: Joi.string().valid(
      'my_created',
      'my_guided',
      'pending_approval',
      'approved',
      'in_progress',
      'completed'
    ),
    search: Joi.string().max(100),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(10),
  }),
};

module.exports = teacherValidation;
