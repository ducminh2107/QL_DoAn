const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    school_year_start: {
      type: Number,
      required: [true, 'Nam hoc bat buoc'],
    },
    school_year_end: {
      type: Number,
      required: [true, 'Nam hoc bat buoc'],
    },
    semester: {
      type: String,
      enum: ['1', '2', 'he'],
      required: [true, 'Hoc ky bat buoc'],
    },
    start_date: {
      type: Date,
      required: [false, 'Ngay bat dau bat buoc'], // making false initially to prevent breaking existing data
    },
    end_date: {
      type: Date,
      required: [false, 'Ngay ket thuc bat buoc'],
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    // registration_periods removed. Mối quan hệ được quản lý qua collection registrationperiods
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

semesterSchema.index({ school_year_start: 1, school_year_end: 1, semester: 1 });

module.exports = mongoose.model('Semester', semesterSchema);
