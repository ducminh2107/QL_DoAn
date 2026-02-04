const User = require('../models/User');

const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

const updateProfile = async (req, res) => {
  res.status(200).json({ success: true, message: 'Update profile' });
};

const getAllUsers = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};

const getUserById = async (req, res) => {
  res.status(200).json({ success: true, data: {} });
};

const updateUser = async (req, res) => {
  res.status(200).json({ success: true, message: 'Update user' });
};

const deleteUser = async (req, res) => {
  res.status(200).json({ success: true, message: 'Delete user' });
};

const updateUserStatus = async (req, res) => {
  res.status(200).json({ success: true, message: 'Update status' });
};

/**
 * @desc    Create user (admin only - for school to add accounts)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = async (req, res, next) => {
  try {
    const {
      user_id,
      email,
      password,
      user_name,
      role,
      user_faculty,
      user_major,
      user_phone
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { user_id }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email
          ? 'Email đã được sử dụng'
          : 'Mã người dùng đã tồn tại'
      });
    }

    // Create user with default password if not provided
    const userPassword = password || '123456'; // Default password
    const user = await User.create({
      user_id,
      email,
      password: userPassword,
      user_name,
      role: role || 'student',
      user_faculty,
      user_major,
      user_phone,
      user_status: true
    });

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      data: {
        user: sanitizeUser(user),
        default_password: !password ? '123456' : undefined
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Import users from Excel (admin only)
 * @route   POST /api/users/import
 * @access  Private/Admin
 */
const importUsers = async (req, res, next) => {
  try {
    // This is a simplified version
    // In real implementation, you would parse Excel file
    const { users } = req.body; // Array of user objects
    
    if (!users || !Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu người dùng không hợp lệ'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const userData of users) {
      try {
        // Check if user exists
        const existingUser = await User.findOne({
          $or: [
            { email: userData.email },
            { user_id: userData.user_id }
          ]
        });

        if (existingUser) {
          results.failed++;
          results.errors.push(`${userData.email} đã tồn tại`);
          continue;
        }

        // Create user with default password
        await User.create({
          ...userData,
          password: userData.password || '123456',
          user_status: true
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${userData.email}: ${error.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Import hoàn tất: ${results.success} thành công, ${results.failed} thất bại`,
      data: results
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateProfile,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  importUsers,
};
