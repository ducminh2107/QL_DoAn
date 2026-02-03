const User = require('../models/User');
const { sanitizeUser, getPagination } = require('../utils/helpers');

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Search filter
    if (req.query.search) {
      query.$or = [
        { user_name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { user_id: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Role filter
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Status filter
    if (req.query.status !== undefined) {
      query.user_status = req.query.status === 'true';
    }

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    // Pagination metadata
    const pagination = getPagination(page, limit, total);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users.map((user) => sanitizeUser(user)),
    });
  } catch (error) {
    next(error);
  }
};

// Add other user controller methods (getUserById, createUser, updateUser, deleteUser, etc.)

module.exports = {
  getAllUsers,
  // Export other methods...
};
