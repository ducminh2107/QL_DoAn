const Topic = require('../../models/Topic');
const Rubric = require('../../models/Rubric');
const Scoreboard = require('../../models/Scoreboard');
const User = require('../../models/User');
const mongoose = require('mongoose');

/**
 * @desc    Get topics ready for grading
 * @route   GET /api/teacher/grading/topics
 * @access  Private/Teacher
 */
const getTopicsForGrading = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { type = 'instructor' } = req.query; // instructor or reviewer

    let query = {
      is_active: true,
      topic_teacher_status: 'approved',
    };

    if (type === 'instructor') {
      query.topic_instructor = teacherId;
    } else if (type === 'reviewer') {
      query.topic_reviewer = teacherId;
    }

    const topics = await Topic.find(query)
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title')
      .populate('topic_group_student.student', 'user_name user_id')
      .select(
        'topic_title topic_description topic_group_student rubric_instructor rubric_reviewer topic_final_report'
      );

    // Add grading status by querying Scoreboards
    const scoreboards = await Scoreboard.find({
      topic_id: { $in: topics.map((t) => t._id) },
      grader: teacherId,
      rubric_category: type,
    });

    const topicsWithStatus = topics.map((topic) => {
      const sb = scoreboards.find(
        (s) => s.topic_id.toString() === topic._id.toString()
      );
      const hasGraded = !!sb;
      return {
        ...topic.toObject(),
        grading_status: hasGraded ? 'graded' : 'pending',
        graded_at: hasGraded ? sb.updated_at : null,
        total_score: hasGraded ? sb.total_score : null,
        // Match frontend expectation for date display
        rubric_instructor:
          hasGraded && type === 'instructor'
            ? {
                submitted_at: sb.updated_at,
                total_score: sb.total_score,
              }
            : null,
        rubric_reviewer:
          hasGraded && type === 'reviewer'
            ? {
                submitted_at: sb.updated_at,
                total_score: sb.total_score,
              }
            : null,
        student_count: (topic.topic_group_student || []).filter(
          (s) => s.status === 'approved'
        ).length,
        has_final_report: !!topic.topic_final_report,
      };
    });

    res.status(200).json({
      success: true,
      type,
      data: topicsWithStatus || [],
    });
  } catch (error) {
    console.error('Error in getTopicsForGrading:', error);
    next(error);
  }
};

/**
 * @desc    Get rubric for grading
 * @route   GET /api/teacher/grading/rubric/:topicId
 * @access  Private/Teacher
 */
const getGradingRubric = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { topicId } = req.params;
    const { type = 'instructor' } = req.query;

    let permissionCheck = {};
    if (type === 'instructor') {
      permissionCheck = { topic_instructor: teacherId };
    } else if (type === 'reviewer') {
      permissionCheck = { topic_reviewer: teacherId };
    } else if (type === 'assembly') {
      // Find the council this topic belongs to
      const Assembly = require('../../models/Assembly');
      const topicInfo = await Topic.findById(topicId);
      if (topicInfo && topicInfo.topic_assembly) {
        const assembly = await Assembly.findById(topicInfo.topic_assembly);
        if (assembly) {
          const isMember =
            (assembly.chairman && assembly.chairman.toString() === teacherId) ||
            (assembly.secretary &&
              assembly.secretary.toString() === teacherId) ||
            (assembly.members || []).some(
              (m) => m.member_id && m.member_id.toString() === teacherId
            );
          if (isMember) {
            permissionCheck = {}; // Allowed
          } else {
            permissionCheck = { _id: null }; // Will force fail
          }
        } else {
          permissionCheck = { _id: null };
        }
      } else {
        permissionCheck = { _id: null };
      }
    }

    // Check if teacher has permission
    const topic = await Topic.findOne({
      _id: topicId,
      is_active: true,
      ...permissionCheck,
    });

    if (!topic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chấm điểm đề tài này',
      });
    }

    // Get appropriate rubric
    const rubricType = type; // instructor, reviewer, or assembly
    let rubric = await Rubric.findOne({
      rubric_category: rubricType,
      rubric_topic_category: topic.topic_category,
      rubric_template: true,
    });

    // Fallback to "assembly" (global graduation rubric)
    if (!rubric) {
      rubric = await Rubric.findOne({
        rubric_category: 'assembly',
        rubric_template: true,
      });
    }

    // Even if no rubric template is found, we should still check for existing scores
    const existingScoreboard = await Scoreboard.findOne({
      topic_id: topic._id,
      grader: teacherId,
      rubric_category: rubricType,
    });
    const existingGrading = existingScoreboard
      ? {
          evaluations: (
            existingScoreboard.rubric_student_evaluations || []
          ).map((e) => ({
            rubric_item_id: e.criteria_id, // Map back for frontend
            criteria_name: e.criteria_name,
            score: e.score,
            comment: e.comment || '',
            max_score: e.max_score,
          })),
          comments: existingScoreboard.comments || '',
          total_score: existingScoreboard.total_score,
        }
      : null;

    if (!rubric && !existingScoreboard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rubric hoặc dữ liệu chấm điểm',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        topic: {
          _id: topic._id,
          topic_title: topic.topic_title,
          topic_description: topic.topic_description,
          topic_final_report: topic.topic_final_report,
        },
        rubric: rubric ? rubric.toObject() : null,
        existing_grading: existingGrading || null,
        students: (topic.topic_group_student || [])
          .filter((s) => s.status === 'approved')
          .map((s) => s.student),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit grades for topic
 * @route   POST /api/teacher/grading/submit/:topicId
 * @access  Private/Teacher
 */
const submitGrades = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { topicId } = req.params;
    const {
      type = 'instructor',
      evaluations,
      comments,
      final_score,
    } = req.body;

    // Validate inputs
    if (!evaluations || !Array.isArray(evaluations)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đánh giá không hợp lệ',
      });
    }

    let permissionCheck = {};
    if (type === 'instructor') {
      permissionCheck = { topic_instructor: teacherId };
    } else if (type === 'reviewer') {
      permissionCheck = { topic_reviewer: teacherId };
    } else if (type === 'assembly') {
      const Assembly = require('../../models/Assembly');
      const topicInfo = await Topic.findById(topicId);
      if (topicInfo && topicInfo.topic_assembly) {
        const assembly = await Assembly.findById(topicInfo.topic_assembly);
        if (assembly) {
          const isMember =
            (assembly.chairman && assembly.chairman.toString() === teacherId) ||
            (assembly.secretary &&
              assembly.secretary.toString() === teacherId) ||
            (assembly.members || []).some(
              (m) => m.member_id && m.member_id.toString() === teacherId
            );
          if (!isMember) permissionCheck = { _id: null };
        } else {
          permissionCheck = { _id: null };
        }
      } else {
        permissionCheck = { _id: null };
      }
    }

    // Check permission
    const topic = await Topic.findOne({
      _id: topicId,
      is_active: true,
      ...permissionCheck,
    }).populate('topic_group_student.student', '_id user_name user_id');

    if (!topic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chấm điểm đề tài này',
      });
    }

    // Get rubric for validation
    const rubricType = type;
    const { rubric_id } = req.body;
    let rubric;
    if (rubric_id) {
      rubric = await Rubric.findById(rubric_id);
    } else {
      rubric = await Rubric.findOne({
        rubric_category: rubricType,
        rubric_topic_category: topic.topic_category,
      });
    }

    if (!rubric) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rubric',
      });
    }

    // Calculate total score if not provided
    let totalScore = final_score;
    if (!totalScore) {
      totalScore = evaluations.reduce((sum, evalItem) => {
        const rubricItem = rubric.rubric_evaluations.find(
          (item) => item._id.toString() === evalItem.rubric_item_id
        );
        if (rubricItem && rubricItem.weight) {
          return sum + (evalItem.score * rubricItem.weight) / 100;
        }
        return sum + evalItem.score;
      }, 0);
    }

    // Prepare grading data
    const gradingData = {
      rubric_id: rubric._id,
      evaluations: evaluations.map((evalItem) => ({
        criteria_id: evalItem.rubric_item_id,
        criteria_name: evalItem.criteria_name,
        score: evalItem.score,
        comment: evalItem.comment || '',
        max_score: evalItem.max_score || 10,
      })),
      total_score: totalScore,
      submitted_at: new Date(),
    };

    // Topic rubric properties removal: Chấm điểm được tách vào Scoreboard

    // Create scoreboard entries for each student
    const approvedStudents = topic.topic_group_student.filter(
      (s) => s.status === 'approved'
    );

    const scoreboardPromises = approvedStudents.map(async (student) => {
      const studentUserId =
        student.student?.user_id ||
        student.student_id ||
        student.student?._id?.toString() ||
        '';
      const scoreboard = await Scoreboard.findOneAndUpdate(
        {
          topic_id: topicId,
          student_id: studentUserId,
          rubric_category: rubricType,
          grader: teacherId,
        },
        {
          rubric_id: rubric._id,
          topic_id: topicId,
          grader: teacherId,
          student_id: studentUserId,
          rubric_student_evaluations: gradingData.evaluations,
          total_score: totalScore,
          student_grades: calculateGrade(totalScore),
          comments: comments || '',
          rubric_category: rubricType,
        },
        { upsert: true, new: true }
      );
      return scoreboard;
    });

    await Promise.all(scoreboardPromises);

    // Create notifications for students
    const notificationPromises = approvedStudents.map(async (student) => {
      const Notification = require('../../models/Notification');
      return Notification.create({
        user_notification_title: `Điểm ${type === 'instructor' ? 'hướng dẫn' : 'phản biện'} cho đề tài "${topic.topic_title}"`,
        user_notification_sender: teacherId,
        user_notification_recipient:
          student.student?.user_id || student.student_id || '',
        user_notification_content:
          comments ||
          `Giảng viên đã chấm điểm ${type === 'instructor' ? 'hướng dẫn' : 'phản biện'} cho đề tài của bạn.`,
        user_notification_type: 'system',
      });
    });

    await Promise.all(notificationPromises);

    res.status(200).json({
      success: true,
      message: 'Chấm điểm thành công',
      data: {
        topic_id: topicId,
        type,
        total_score: totalScore,
        student_count: approvedStudents.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get grading history
 * @route   GET /api/teacher/grading/history
 * @access  Private/Teacher
 */
const getGradingHistory = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { type, year, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { grader: teacherId };

    if (type) {
      query.rubric_category = type;
    }

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01`);
      query.created_at = { $gte: startDate, $lt: endDate };
    }

    const [scoreboards, total] = await Promise.all([
      Scoreboard.find(query)
        .populate('topic_id', 'topic_title topic_category')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Scoreboard.countDocuments(query),
    ]);

    if (!scoreboards) {
      return res.status(200).json({ success: true, stats: {}, data: [] });
    }

    const studentIds = [
      ...new Set(
        scoreboards.map((scoreboard) => scoreboard.student_id).filter(Boolean)
      ),
    ];
    const students = studentIds.length
      ? await User.find({ user_id: { $in: studentIds } }).select(
          'user_id user_name'
        )
      : [];
    const studentMap = new Map(
      students.map((student) => [student.user_id, student])
    );

    const scoreboardsWithStudents = scoreboards.map((scoreboard) => ({
      ...scoreboard.toObject(),
      student_id:
        studentMap.get(
          scoreboard.student_id ? scoreboard.student_id.toString() : ''
        ) || null,
    }));

    // Get statistics
    const stats = {
      total_graded: total,
      average_score: 0,
      by_type: {},
    };

    if (scoreboards.length > 0) {
      stats.average_score =
        scoreboards.reduce((sum, sb) => sum + (sb.total_score || 0), 0) /
        scoreboards.length;

      try {
        const categories = await Scoreboard.aggregate([
          {
            $match: { grader: new mongoose.Types.ObjectId(String(teacherId)) },
          },
          {
            $group: {
              _id: '$rubric_category',
              count: { $sum: 1 },
              avg_score: { $avg: '$total_score' },
            },
          },
        ]);

        categories.forEach((cat) => {
          if (cat && cat._id) {
            stats.by_type[cat._id] = {
              count: cat.count,
              avg_score: cat.avg_score || 0,
            };
          }
        });
      } catch (aggError) {
        console.error('Aggregation error in getGradingHistory:', aggError);
        // Continue without stats if aggregation fails
      }
    }

    res.status(200).json({
      success: true,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      data: scoreboardsWithStudents,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function
const calculateGrade = (score) => {
  if (score >= 9.0) return 'A';
  if (score >= 8.0) return 'B';
  if (score >= 7.0) return 'C';
  if (score >= 6.0) return 'D';
  return 'F';
};

module.exports = {
  getTopicsForGrading,
  getGradingRubric,
  submitGrades,
  getGradingHistory,
};
