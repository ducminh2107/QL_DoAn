const Topic = require('../../models/Topic');
const Rubric = require('../../models/Rubric');
const Scoreboard = require('../../models/Scoreboard');

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
      topic_teacher_status: 'approved'
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
      .select('topic_title topic_description topic_group_student rubric_instructor rubric_reviewer topic_final_report');

    // Add grading status
    const topicsWithStatus = topics.map(topic => {
      const rubricField = type === 'instructor' ? 'rubric_instructor' : 'rubric_reviewer';
      const hasGraded = topic[rubricField] && topic[rubricField].total_score !== undefined;
      
      return {
        ...topic.toObject(),
        grading_status: hasGraded ? 'graded' : 'pending',
        graded_at: hasGraded ? topic[rubricField].submitted_at : null,
        total_score: hasGraded ? topic[rubricField].total_score : null,
        student_count: topic.topic_group_student.filter(s => s.status === 'approved').length,
        has_final_report: !!topic.topic_final_report
      };
    });

    res.status(200).json({
      success: true,
      type,
      data: topicsWithStatus
    });

  } catch (error) {
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

    // Check if teacher has permission
    const topic = await Topic.findOne({
      _id: topicId,
      is_active: true,
      ...(type === 'instructor' ? { topic_instructor: teacherId } : { topic_reviewer: teacherId })
    });

    if (!topic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chấm điểm đề tài này'
      });
    }

    // Get appropriate rubric
    const rubricType = type === 'instructor' ? 'instructor' : 'reviewer';
    const rubric = await Rubric.findOne({
      rubric_category: rubricType,
      rubric_topic_category: topic.topic_category,
      rubric_template: true
    });

    if (!rubric) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rubric cho loại chấm điểm này'
      });
    }

    // Get already graded data if exists
    const rubricField = type === 'instructor' ? 'rubric_instructor' : 'rubric_reviewer';
    const existingGrading = topic[rubricField];

    res.status(200).json({
      success: true,
      data: {
        topic: {
          _id: topic._id,
          topic_title: topic.topic_title,
          topic_description: topic.topic_description
        },
        rubric: rubric.toObject(),
        existing_grading: existingGrading || null,
        students: topic.topic_group_student
          .filter(s => s.status === 'approved')
          .map(s => s.student)
      }
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
    const { type = 'instructor', evaluations, comments, final_score } = req.body;

    // Validate inputs
    if (!evaluations || !Array.isArray(evaluations)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đánh giá không hợp lệ'
      });
    }

    // Check permission
    const topic = await Topic.findOne({
      _id: topicId,
      is_active: true,
      ...(type === 'instructor' ? { topic_instructor: teacherId } : { topic_reviewer: teacherId })
    }).populate('topic_group_student.student', '_id user_name user_id');

    if (!topic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chấm điểm đề tài này'
      });
    }

    // Get rubric for validation
    const rubricType = type === 'instructor' ? 'instructor' : 'reviewer';
    const rubric = await Rubric.findOne({
      rubric_category: rubricType,
      rubric_topic_category: topic.topic_category
    });

    if (!rubric) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rubric'
      });
    }

    // Calculate total score if not provided
    let totalScore = final_score;
    if (!totalScore) {
      totalScore = evaluations.reduce((sum, evalItem) => {
        const rubricItem = rubric.rubric_evaluations.find(
          item => item._id.toString() === evalItem.rubric_item_id
        );
        if (rubricItem && rubricItem.weight) {
          return sum + (evalItem.score * rubricItem.weight / 100);
        }
        return sum + evalItem.score;
      }, 0);
    }

    // Prepare grading data
    const gradingData = {
      rubric_id: rubric._id,
      evaluations: evaluations.map(evalItem => ({
        criteria_id: evalItem.rubric_item_id,
        criteria_name: evalItem.criteria_name,
        score: evalItem.score,
        comment: evalItem.comment || '',
        max_score: evalItem.max_score || 10
      })),
      total_score: totalScore,
      submitted_at: new Date()
    };

    // Update topic with grading
    const rubricField = type === 'instructor' ? 'rubric_instructor' : 'rubric_reviewer';
    topic[rubricField] = gradingData;
    await topic.save();

    // Create scoreboard entries for each student
    const approvedStudents = topic.topic_group_student.filter(s => s.status === 'approved');
    
    const scoreboardPromises = approvedStudents.map(async (student) => {
      const scoreboard = await Scoreboard.findOneAndUpdate(
        {
          topic_id: topicId,
          student_id: student.student._id,
          rubric_category: rubricType,
          grader: teacherId
        },
        {
          rubric_id: rubric._id,
          topic_id: topicId,
          grader: teacherId,
          student_id: student.student._id,
          rubric_student_evaluations: evaluations,
          total_score: totalScore,
          student_grades: calculateGrade(totalScore),
          rubric_category: rubricType
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
        user_notification_recipient: student.student._id,
        user_notification_content: comments || `Giảng viên đã chấm điểm ${type === 'instructor' ? 'hướng dẫn' : 'phản biện'} cho đề tài của bạn.`,
        user_notification_type: 'system'
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
        student_count: approvedStudents.length
      }
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
        .populate('student_id', 'user_name user_id')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Scoreboard.countDocuments(query)
    ]);

    // Get statistics
    const stats = {
      total_graded: total,
      average_score: 0,
      by_type: {}
    };

    if (scoreboards.length > 0) {
      stats.average_score = scoreboards.reduce((sum, sb) => sum + (sb.total_score || 0), 0) / scoreboards.length;
      
      // Group by rubric category
      const categories = await Scoreboard.aggregate([
        { $match: { grader: teacherId } },
        { $group: {
          _id: '$rubric_category',
          count: { $sum: 1 },
          avg_score: { $avg: '$total_score' }
        }}
      ]);
      
      categories.forEach(cat => {
        stats.by_type[cat._id] = {
          count: cat.count,
          avg_score: cat.avg_score
        };
      });
    }

    res.status(200).json({
      success: true,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: scoreboards
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
  getGradingHistory
};