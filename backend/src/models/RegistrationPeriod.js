const mongoose = require('mongoose');

const registrationPeriodSchema = new mongoose.Schema(
  {
    registration_period_semester: {
      type: String,
      required: [true, 'Ky dang ky la bat buoc'],
      trim: true,
    },
    registration_period_start: {
      type: Date,
      required: [true, 'Ngay bat dau bat buoc'],
    },
    registration_period_end: {
      type: Date,
      required: [true, 'Ngay ket thuc bat buoc'],
    },
    registration_period_status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    // Optional legacy config fields (for existing controllers)
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
    semester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
    },
    block_topic: String,
    topics_allowed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

registrationPeriodSchema.index({ registration_period_status: 1 });
registrationPeriodSchema.index({
  registration_period_start: 1,
  registration_period_end: 1,
});

registrationPeriodSchema.virtual('is_active_now').get(function () {
  const now = new Date();
  return (
    this.registration_period_status === 'active' &&
    now >= this.registration_period_start &&
    now <= this.registration_period_end
  );
});

registrationPeriodSchema.methods.canStudentRegister = function (
  studentMajor,
  studentFaculty
) {
  if (!this.is_active_now || !this.allow_registration) {
    return false;
  }

  if (this.allowed_majors.length > 0) {
    return this.allowed_majors.includes(studentMajor);
  }

  if (this.allowed_faculties.length > 0) {
    return this.allowed_faculties.includes(studentFaculty);
  }

  return true;
};

module.exports = mongoose.model('RegistrationPeriod', registrationPeriodSchema);
