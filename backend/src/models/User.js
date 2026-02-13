const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email la bat buoc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email khong hop le',
      ],
    },
    password: {
      type: String,
      required: [true, 'Mat khau la bat buoc'],
      minlength: 6,
      select: false,
    },

    user_id: {
      type: String,
      required: [true, 'Ma nguoi dung la bat buoc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    user_name: {
      type: String,
      required: [true, 'Ho ten la bat buoc'],
      trim: true,
    },
    user_avatar: {
      type: String,
      default:
        'https://res.cloudinary.com/demo/image/upload/v1234567/default-avatar.png',
    },
    user_date_of_birth: Date,
    user_CCCD: {
      type: String,
      unique: true,
      sparse: true,
    },
    user_phone: String,
    user_permanent_address: String,
    user_temporary_address: String,
    user_department: String,
    user_faculty: String,
    user_major: String,
    user_gender: {
      type: String,
      enum: ['Nam', 'Nữ', 'Khác'],
    },
    user_ethnicity: String,
    user_religion: String,
    user_birth_place: String,
    user_nationality: {
      type: String,
      default: 'Việt Nam',
    },
    user_class: String,
    user_training_system: String,
    user_academic_year: String,

    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student',
    },
    user_status: {
      type: Boolean,
      default: true,
    },
    user_average_grade: {
      type: Number,
      min: 0,
      max: 10,
    },
    user_transcript: String,

    current_topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    registered_topics: [
      {
        topic: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Topic',
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected', 'withdrawn'],
        },
        registered_at: Date,
        updated_at: Date,
      },
    ],
    proposed_topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: String,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: Date.now() });
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      user_id: this.user_id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: '30d' }
  );
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.virtual('fullName').get(function () {
  return this.user_name;
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ user_id: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ user_faculty: 1, user_major: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ refreshToken: 1 });

module.exports = mongoose.model('User', userSchema);
