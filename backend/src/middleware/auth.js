const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Protect routes - require JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để truy cập tài nguyên này',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }

      // Check if user is active
      if (!user.user_status) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản đã bị khóa',
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token không hợp lệ',
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token đã hết hạn. Vui lòng đăng nhập lại',
        });
      }

      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Role-based authorization
 * @param   {...String} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò ${req.user.role} không có quyền truy cập tài nguyên này`,
      });
    }
    next();
  };
};

/**
 * @desc    Check if user is owner of resource
 * @param   {String} resourceUserId - User ID from resource
 */
const isOwner = (resourceUserId) => {
  return (req, res, next) => {
    if (
      req.user.role !== 'admin' &&
      req.user._id.toString() !== resourceUserId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này',
      });
    }
    next();
  };
};

/**
 * @desc    Check if user can access their own data
 */
const canAccessOwnData = (req, res, next) => {
  const requestedUserId = req.params.id || req.params.userId;

  if (
    req.user.role !== 'admin' &&
    req.user._id.toString() !== requestedUserId
  ) {
    return res.status(403).json({
      success: false,
      message: 'Bạn chỉ có thể truy cập dữ liệu của chính mình',
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  isOwner,
  canAccessOwnData,
};
