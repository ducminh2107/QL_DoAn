const Topic = require('../../models/Topic');
const Rubric = require('../../models/Rubric');
const Scoreboard = require('../../models/Scoreboard');
const Assembly = require('../../models/Assembly');
const User = require('../../models/User');

/**
 * @desc    Get rubric evaluations for teacher
 * @route   GET /api/teacher/rubric-evaluations
 * @access  Private/Teacher
 */
const getRubricEvaluations = async (req, res, next) => {
  try {
    const teacherId = req.user._id;

    const evaluations = await Scoreboard.find({ grader: teacherId })
      .populate('topic_id', 'topic_title')
      .sort({ created_at: -1 });

    const studentIds = [
      ...new Set(evaluations.map((item) => item.student_id).filter(Boolean)),
    ];
    const students = studentIds.length
      ? await User.find({ user_id: { $in: studentIds } }).select(
          'user_id user_name email'
        )
      : [];
    const studentMap = new Map(
      students.map((student) => [student.user_id, student])
    );

    const data = evaluations.map((evalItem) => {
      const student = studentMap.get(evalItem.student_id);
      return {
        _id: evalItem._id,
        student_id: evalItem.student_id,
        student_name: student?.user_name,
        student_code: student?.user_id,
        topic_title: evalItem.topic_id?.topic_title,
        topic_id: evalItem.topic_id?._id,
        score: evalItem.total_score || 0,
        criteria_scores: evalItem.rubric_student_evaluations || [],
        feedback: '',
        status: evalItem.total_score ? 'evaluated' : 'pending',
        created_at: evalItem.created_at,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit rubric evaluation
 * @route   POST /api/teacher/rubric-evaluations/{studentId}
 * @access  Private/Teacher
 */
const submitRubricEvaluation = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { topicId, score, criteria_scores, rubric_category } = req.body;
    const teacherId = req.user._id;

    if (score === undefined || score < 0 || score > 10) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 0 and 10',
      });
    }

    const evaluation = await Scoreboard.findOneAndUpdate(
      {
        student_id: studentId,
        topic_id: topicId,
        grader: teacherId,
      },
      {
        total_score: score,
        rubric_student_evaluations: criteria_scores || [],
        rubric_category: rubric_category || 'instructor',
        student_grades: '',
        updated_at: new Date(),
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Saved successfully',
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get teacher's councils
 * @route   GET /api/teacher/councils
 * @access  Private/Teacher
 */
const getTeacherCouncils = async (req, res, next) => {
  try {
    const teacherId = req.user._id;
    const { status } = req.query;

    const filter = {
      $or: [
        { chairman: teacherId },
        { secretary: teacherId },
        { 'members.member_id': teacherId },
      ],
    };

    if (status) {
      const statusMap = {
        scheduled: 'planning',
        in_progress: 'active',
        completed: 'completed',
        cancelled: 'cancelled',
      };
      const normalized = statusMap[status] || status;
      if (
        ['planning', 'active', 'completed', 'cancelled'].includes(normalized)
      ) {
        filter.assembly_status = normalized;
      }
    }

    const assemblies = await Assembly.find(filter).sort({ created_at: -1 });

    const userIdSet = new Set();
    assemblies.forEach((assembly) => {
      if (assembly.chairman) {
        userIdSet.add(assembly.chairman.toString());
      }
      if (assembly.secretary) {
        userIdSet.add(assembly.secretary.toString());
      }
      (assembly.members || []).forEach((member) => {
        if (member.member_id) {
          userIdSet.add(member.member_id.toString());
        }
      });
    });

    const users = userIdSet.size
      ? await User.find({ _id: { $in: Array.from(userIdSet) } }).select(
          '_id user_name'
        )
      : [];
    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.user_name])
    );

    const statusOutMap = {
      planning: 'scheduled',
      active: 'in_progress',
      completed: 'completed',
      cancelled: 'cancelled',
    };

    const Topic = require('../../models/Topic');
    const topics = await Topic.find({
      topic_assembly: { $in: assemblies.map((a) => a._id) },
    }).select('_id topic_title topic_assembly');

    const Scoreboard = require('../../models/Scoreboard');
    const scoreboards = await Scoreboard.find({
      topic_id: { $in: topics.map((t) => t._id) },
      rubric_category: 'assembly',
      grader: teacherId,
    });

    const data = assemblies.map((assembly) => {
      let role = 'member';
      if (
        assembly.chairman &&
        assembly.chairman.toString() === teacherId.toString()
      ) {
        role = 'chair';
      } else if (
        assembly.secretary &&
        assembly.secretary.toString() === teacherId.toString()
      ) {
        role = 'secretary';
      } else {
        const member = (assembly.members || []).find(
          (item) =>
            item.member_id && item.member_id.toString() === teacherId.toString()
        );
        if (member?.role) {
          role = member.role;
        }
      }

      return {
        _id: assembly._id,
        council_name: assembly.assembly_name,
        name: assembly.assembly_name,
        role,
        members: (assembly.members || []).map((member) => ({
          name:
            member.member_name ||
            (member.member_id ? userMap.get(member.member_id.toString()) : ''),
          role: member.role,
        })),
        meeting_date: assembly.defense_date,
        location: assembly.defense_location,
        status: statusOutMap[assembly.assembly_status] || 'scheduled',
        description: assembly.assembly_description || '',
        topics: topics
          .filter(
            (t) =>
              t.topic_assembly &&
              t.topic_assembly.toString() === assembly._id.toString()
          )
          .map((t) => {
            const graded = scoreboards.some(
              (s) => s.topic_id.toString() === t._id.toString()
            );
            return {
              _id: t._id,
              topic_title: t.topic_title,
              grading_status: graded ? 'graded' : 'pending',
            };
          }),
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students progress for monitoring
 * @route   GET /api/teacher/students-progress
 * @access  Private/Teacher
 */
const getStudentsProgress = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    const topics = await Topic.find({
      $or: [
        { topic_instructor: teacherId },
        { topic_instructor_id: req.user.user_id },
      ],
    }).populate('topic_group_student.student', 'user_name user_id');

    const students = [];

    topics.forEach((topic) => {
      (topic.topic_group_student || []).forEach((member) => {
        if (member.student) {
          const existing = students.find(
            (s) => s.student_id === member.student._id.toString()
          );
          if (!existing) {
            let actualProgress = 0;
            if (topic.milestones && topic.milestones.length > 0) {
              const completedCount = topic.milestones.filter(
                (m) => m.status === 'completed' || m.completed_date
              ).length;
              actualProgress = (completedCount / topic.milestones.length) * 100;
            }

            students.push({
              student_id: member.student._id,
              student_name: member.student.user_name,
              student_code: member.student.user_id,
              progress: actualProgress,
              topic_title: topic.topic_title,
              topic_id: topic._id,
              status: actualProgress === 100 ? 'completed' : 'in_progress',
              last_submission: topic.updatedAt || new Date(),
            });
          }
        }
      });
    });

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send progress feedback to student
 * @route   POST /api/teacher/students-progress/:studentId/feedback
 * @access  Private/Teacher
 */
const sendProgressFeedback = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { feedback, topic_id } = req.body;
    const teacherId = req.user.id;

    if (!feedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback is required',
      });
    }

    const topic = await Topic.findOne({
      _id: topic_id,
      $or: [
        { topic_instructor: teacherId },
        { topic_instructor_id: req.user.user_id },
      ],
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found or unauthorized',
      });
    }

    // Save notes to the student array in topic if we wanted to...
    // Or just send a Notification, which is simpler and makes more sense as "feedback"
    const Notification = require('../../models/Notification');
    await Notification.create({
      user_notification_title: `Phản hồi tiến độ đề tài "${topic.topic_title}"`,
      user_notification_sender: teacherId,
      user_notification_recipient: studentId,
      user_notification_content: feedback,
      user_notification_type: 'system',
    });

    res.status(200).json({
      success: true,
      message: 'Đã gửi phản hồi thành công',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get teaching history
 * @route   GET /api/teacher/teaching-history
 * @access  Private/Teacher
 */
const getTeachingHistory = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    const topics = await Topic.find({
      $or: [
        { topic_instructor: teacherId },
        { topic_instructor_id: req.user.user_id },
      ],
    })
      .populate('topic_group_student.student', 'user_name user_id')
      .populate('topic_category', 'topic_category_title')
      .populate(
        'topic_registration_period',
        'registration_period_semester registration_period_year'
      )
      .select(
        'topic_title topic_group_student topic_category topic_registration_period created_at is_completed status rubric_instructor updated_at'
      )
      .sort({ created_at: -1 });

    const topicIds = topics.map((t) => t._id);
    const scoreboards = await Scoreboard.find({
      topic_id: { $in: topicIds },
      grader: teacherId,
    });

    const scoreboardMap = scoreboards.reduce((map, sb) => {
      if (!map[sb.topic_id]) {
        map[sb.topic_id] = sb.total_score;
      }
      return map;
    }, {});

    const history = topics.map((topic) => {
      const students =
        topic.topic_group_student?.filter((member) => member.student) || [];
      const studentNames =
        students.map((m) => m.student.user_name).join(', ') || 'Chưa phân công';
      const studentIds = students.map((m) => m.student.user_id).join(', ');

      const academicYear = topic.topic_registration_period
        ? `Học kỳ ${topic.topic_registration_period.registration_period_semester} - Năm học ${topic.topic_registration_period.registration_period_year}`
        : 'Chưa xác định';

      return {
        _id: topic._id,
        topic_title: topic.topic_title,
        students_count: students.length,
        student_name: studentNames,
        student_id: studentIds,
        average_score:
          scoreboardMap[topic._id] !== undefined
            ? scoreboardMap[topic._id]
            : null,
        status: topic.is_completed ? 'completed' : 'ongoing',
        category: topic.topic_category?.topic_category_title || '',
        academic_year: academicYear,
        completed_at: topic.updated_at,
      };
    });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download teaching certificate
 * @route   GET /api/teacher/teaching-history/{id}/certificate
 * @access  Private/Teacher
 */
const downloadCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const topic = await Topic.findById(id).populate(
      'topic_instructor',
      'user_name email'
    );

    if (!topic || topic.topic_instructor?._id.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Not allowed to download this certificate',
      });
    }

    const pdfContent = `
Certificate of Teaching
Subject: ${topic.topic_title}
Teacher: ${topic.topic_instructor.user_name}
Date: ${new Date().toLocaleDateString('vi-VN')}
This is to certify that...
    `;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate_${id}.pdf"`
    );
    res.send(pdfContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRubricEvaluations,
  submitRubricEvaluation,
  getTeacherCouncils,
  getStudentsProgress,
  sendProgressFeedback,
  getTeachingHistory,
  downloadCertificate,
};
