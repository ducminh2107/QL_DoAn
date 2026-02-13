const User = require('../models/User');
const Topic = require('../models/Topic');
const Semester = require('../models/Semester');

const getSystemStats = async (req, res, next) => {
  try {
    const [
      userCount,
      studentCount,
      teacherCount,
      topicCount,
      approvedTopicCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Topic.countDocuments({ is_active: true }),
      Topic.countDocuments({
        is_active: true,
        topic_teacher_status: 'approved',
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: userCount,
          students: studentCount,
          teachers: teacherCount,
        },
        topics: {
          total: topicCount,
          approved: approvedTopicCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    // This is a placeholder for more complex reporting if needed
    res.status(200).json({ success: true, message: 'Reports data' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemStats,
  getReports,
};
