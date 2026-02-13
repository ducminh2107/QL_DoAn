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
    registration_periods: [
      {
        period_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'RegistrationPeriod',
        },
        period_name: String,
        start_date: Date,
        end_date: Date,
        status: String,
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

semesterSchema.index({ school_year_start: 1, school_year_end: 1, semester: 1 });

module.exports = mongoose.model('Semester', semesterSchema);
