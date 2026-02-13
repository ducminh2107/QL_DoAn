const Joi = require('joi');

// Validation schemas
const authValidation = {
  // Register validation
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu là bắt buộc',
    }),
    user_id: Joi.string().required().messages({
      'any.required': 'Mã người dùng là bắt buộc',
    }),
    user_name: Joi.string().required().messages({
      'any.required': 'Họ tên là bắt buộc',
    }),
    role: Joi.string().valid('student', 'teacher', 'admin').default('student'),
    user_phone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .messages({
        'string.pattern': 'Số điện thoại không hợp lệ',
      }),
  }),

  // Login validation
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Mật khẩu là bắt buộc',
    }),
  }),

  // Forgot password validation
  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),
  }),

  // Reset password validation
  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Token là bắt buộc',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu là bắt buộc',
    }),
  }),

  // Change password validation
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Mật khẩu hiện tại là bắt buộc',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu mới là bắt buộc',
    }),
  }),

  // Update profile validation
  updateProfile: Joi.object({
    user_name: Joi.string(),
    user_phone: Joi.string().allow('', null),
    user_date_of_birth: Joi.date().allow('', null),
    user_permanent_address: Joi.string().allow('', null),
    user_temporary_address: Joi.string().allow('', null),
    user_avatar: Joi.string().allow('', null),
    user_gender: Joi.string().valid('Nam', 'Nữ', 'Khác').allow('', null),
    user_ethnicity: Joi.string().allow('', null),
    user_religion: Joi.string().allow('', null),
    user_birth_place: Joi.string().allow('', null),
    user_nationality: Joi.string().allow('', null),
    user_class: Joi.string().allow('', null),
    user_training_system: Joi.string().allow('', null),
    user_academic_year: Joi.string().allow('', null),
    user_faculty: Joi.string().allow('', null),
    user_major: Joi.string().allow('', null),
    user_CCCD: Joi.string().allow('', null),
  }),
};

module.exports = authValidation;
