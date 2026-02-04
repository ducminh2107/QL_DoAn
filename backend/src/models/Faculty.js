const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    faculty_title: {
      type: String,
      required: [true, 'Tên khoa là bắt buộc'],
      unique: true,
      trim: true,
      maxlength: [200, 'Tên khoa không quá 200 ký tự'],
    },
    faculty_description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Mô tả không quá 1000 ký tự'],
    },
    faculty_code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    dean: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contact_email: String,
    contact_phone: String,

    // Academic information
    total_majors: {
      type: Number,
      default: 0,
    },
    total_teachers: {
      type: Number,
      default: 0,
    },
    total_students: {
      type: Number,
      default: 0,
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

facultySchema.index({ faculty_title: 1 }, { unique: true });
facultySchema.index({ faculty_code: 1 }, { unique: true });
facultySchema.index({ is_active: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
