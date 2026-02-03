const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email không hợp lệ',
      ],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: 6,
      select: false, // Không trả về password trong query
    },

    // User Info
    user_id: {
      type: String,
      required: [true, 'Mã người dùng là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    user_name: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true,
    },
    user_avatar: {
      type: String,
      default:
        'https://res.cloudinary.com/demo/image/upload/v1234567/default-avatar.png',
    },

    // Personal Info
    user_date_of_birth: Date,
    user_CCCD: {
      type: String,
      unique: true,
      sparse: true, // Cho phép null nhưng vẫn unique
    },
    user_phone: String,
    user_permanent_address: String,
    user_temporary_address: String,

    // Academic Info
    user_department: String,
    user_faculty: String,
    user_major: String,

    // System
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
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
      default: 0,
    },
    user_transcript: String,

    // Tokens for password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Refresh token
    refreshToken: String,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password trước khi save
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

// Update updatedAt timestamp
userSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
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

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: '30d' }
  );
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 phút

  return resetToken;
};

// Virtual for full name (có thể thêm nếu cần)
userSchema.virtual('fullName').get(function () {
  return this.user_name;
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ user_id: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ user_faculty: 1, user_major: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ refreshToken: 1 });

module.exports = mongoose.model('User', userSchema);
