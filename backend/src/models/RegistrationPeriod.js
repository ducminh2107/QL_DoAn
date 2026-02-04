const mongoose = require('mongoose');

const registrationPeriodSchema = new mongoose.Schema(
  {
    registration_period_semester: {
      type: String,
      required: [true, 'Kỳ đăng ký là bắt buộc'],
      unique: true,
      trim: true,
    },
    registration_period_start: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
    },
    registration_period_end: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc'],
    },
    registration_period_status: {
      type: String,
      enum: ['upcoming', 'active', 'closed'],
      default: 'upcoming',
    },

    // Configuration
    max_topics_per_student: {
      type: Number,
      default: 3,
      min: 1,
    },
    max_students_per_topic: {
      type: Number,
      default: 5,
      min: 1,
    },
    allow_proposal: {
      type: Boolean,
      default: true,
    },
    allow_registration: {
      type: Boolean,
      default: true,
    },

    // Block specific majors or faculties
    allowed_majors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major',
      },
    ],
    allowed_faculties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
      },
    ],

    block_topic: String,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Indexes
registrationPeriodSchema.index({ registration_period_status: 1 });
registrationPeriodSchema.index({
  registration_period_start: 1,
  registration_period_end: 1,
});

// Virtual for checking if period is active
registrationPeriodSchema.virtual('is_active_now').get(function () {
  const now = new Date();
  return (
    this.registration_period_status === 'active' &&
    now >= this.registration_period_start &&
    now <= this.registration_period_end
  );
});

// Method to check if student can register
registrationPeriodSchema.methods.canStudentRegister = function (
  studentMajor,
  studentFaculty
) {
  // Check if period is active
  if (!this.is_active_now || !this.allow_registration) {
    return false;
  }

  // Check if student's major is allowed
  if (this.allowed_majors.length > 0) {
    return this.allowed_majors.includes(studentMajor);
  }

  // Check if student's faculty is allowed
  if (this.allowed_faculties.length > 0) {
    return this.allowed_faculties.includes(studentFaculty);
  }

  return true;
};

module.exports = mongoose.model('RegistrationPeriod', registrationPeriodSchema);
