const User = require('../models/User');
const Topic = require('../models/Topic');
const Semester = require('../models/Semester');
const Council = require('../models/Council');
const Scoreboard = require('../models/Scoreboard');

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

const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalTopics,
      approvedTopics,
      pendingTopics,
      totalCouncils,
      activeCouncils,
      completedCouncils,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Topic.countDocuments({ 
        is_active: true, 
        topic_teacher_status: { $ne: 'rejected' },
        topic_leader_status: { $ne: 'rejected' }
      }),
      Topic.countDocuments({
        is_active: true,
        topic_teacher_status: 'approved',
        topic_leader_status: 'approved',
      }),
      Topic.countDocuments({
        is_active: true,
        topic_teacher_status: { $ne: 'rejected' },
        topic_leader_status: { $ne: 'rejected' },
        $or: [
          { topic_teacher_status: 'pending' },
          { topic_leader_status: 'pending' }
        ]
      }),
      Council.countDocuments({ is_active: true }),
      Council.countDocuments({ is_active: true, status: 'upcoming' }),
      Council.countDocuments({ is_active: true, status: 'completed' }),
    ]);

    const activeTeachersArray = await Topic.distinct('topic_instructor');
    const activeTeachers = activeTeachersArray.length;
    const inactiveTeachers = Math.max(0, totalTeachers - activeTeachers);

    // Get simple aggregated student numbers
    const topicsWithStudents = await Topic.find(
      { is_active: true },
      'topic_group_student is_completed'
    );
    let registeredStudents = 0;
    let completedStudents = 0;

    topicsWithStudents.forEach((t) => {
      const g = t.topic_group_student || [];
      registeredStudents += g.length;
      if (t.is_completed) {
        completedStudents += g.length;
      }
    });

    const completionRate =
      registeredStudents > 0
        ? (completedStudents / registeredStudents) * 100
        : 0;

    const scoreboards = await Scoreboard.find({ total_score: { $ne: null } });
    let averageScore = 0;
    const scoreDistribution = {
      '< 4': 0,
      '4 - 6': 0,
      '6 - 8': 0,
      '8 - 10': 0,
    };

    if (scoreboards.length > 0) {
      averageScore =
        scoreboards.reduce((acc, sb) => acc + sb.total_score, 0) /
        scoreboards.length;

      scoreboards.forEach((sb) => {
        const s = sb.total_score;
        if (s < 4) scoreDistribution['< 4']++;
        else if (s < 6) scoreDistribution['4 - 6']++;
        else if (s < 8) scoreDistribution['6 - 8']++;
        else scoreDistribution['8 - 10']++;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        total_users: totalUsers,
        total_students: totalStudents,
        registered_students: registeredStudents,
        completed_students: completedStudents,
        total_topics: totalTopics,
        approved_topics: approvedTopics,
        pending_topics: pendingTopics,
        total_teachers: totalTeachers,
        active_teachers: activeTeachers,
        inactive_teachers: inactiveTeachers,
        total_councils: totalCouncils,
        active_councils: activeCouncils,
        completed_councils: completedCouncils,
        completion_rate: parseFloat(completionRate.toFixed(1)),
        average_score: parseFloat(averageScore.toFixed(1)),
        score_distribution: Object.keys(scoreDistribution).map((k) => ({
          name: k,
          value: scoreDistribution[k],
        })),
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
  getDashboard,
};
