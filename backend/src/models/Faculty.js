const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    faculty_title: {
      type: String,
      required: [true, 'Ten khoa la bat buoc'],
      unique: true,
      trim: true,
      maxlength: [200, 'Ten khoa khong qua 200 ky tu'],
    },
    faculty_description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Mo ta khong qua 1000 ky tu'],
    },
    faculty_majors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major',
      },
    ],

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
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

facultySchema.index({ faculty_title: 1 }, { unique: true });
facultySchema.index({ faculty_code: 1 }, { unique: true });
facultySchema.index({ is_active: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
