const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema(
  {
    major_faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Khoa quan ly la bat buoc'],
    },
    major_title: {
      type: String,
      required: [true, 'Ten nganh la bat buoc'],
      unique: true,
      trim: true,
      maxlength: [200, 'Ten nganh khong qua 200 ky tu'],
    },
    major_description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Mo ta khong qua 1000 ky tu'],
    },
    training_system: {
      type: String,
      enum: ['chinh_quy', 'lien_thong'],
      default: 'chinh_quy',
    },

    major_code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    department_head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

majorSchema.index({ major_title: 1 }, { unique: true });
majorSchema.index({ major_code: 1 }, { unique: true });
majorSchema.index({ major_faculty: 1 });
majorSchema.index({ is_active: 1 });

majorSchema.virtual('faculty_name').get(async function () {
  if (this.populated('major_faculty')) {
    return this.major_faculty.faculty_title;
  }
  const faculty = await mongoose.model('Faculty').findById(this.major_faculty);
  return faculty ? faculty.faculty_title : '';
});

module.exports = mongoose.model('Major', majorSchema);
