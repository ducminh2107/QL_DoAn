const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema(
  {
    major_title: {
      type: String,
      required: [true, 'Tên ngành là bắt buộc'],
      unique: true,
      trim: true,
      maxlength: [200, 'Tên ngành không quá 200 ký tự'],
    },
    major_description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Mô tả không quá 1000 ký tự'],
    },
    major_code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // References
    major_faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Khoa quản lý là bắt buộc'],
    },
    department_head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Training information
    training_system: {
      type: String,
      enum: ['chính_quy', 'liên_thông', 'tại_chức', 'chất_lượng_cao'],
      default: 'chính_quy',
    },
    duration_years: {
      type: Number,
      min: 2,
      max: 6,
      default: 4,
    },
    total_credits: {
      type: Number,
      min: 100,
      max: 200,
      default: 140,
    },

    // Statistics
    total_students: {
      type: Number,
      default: 0,
    },
    total_teachers: {
      type: Number,
      default: 0,
    },
    total_topics: {
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

majorSchema.index({ major_title: 1 }, { unique: true });
majorSchema.index({ major_code: 1 }, { unique: true });
majorSchema.index({ major_faculty: 1 });
majorSchema.index({ is_active: 1 });

// Virtual for faculty name
majorSchema.virtual('faculty_name').get(async function () {
  if (this.populated('major_faculty')) {
    return this.major_faculty.faculty_title;
  }
  const faculty = await mongoose.model('Faculty').findById(this.major_faculty);
  return faculty ? faculty.faculty_title : '';
});

module.exports = mongoose.model('Major', majorSchema);
