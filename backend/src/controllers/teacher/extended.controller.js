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
    const teacherUserId = req.user.user_id;

    const evaluations = await Scoreboard.find({ grader: teacherUserId })
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
    const teacherUserId = req.user.user_id;

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
        grader: teacherUserId,
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
    const teacherUserId = req.user.user_id;
    const { status } = req.query;

    const filter = {
      $or: [
        { chairman: teacherUserId },
        { secretary: teacherUserId },
        { 'members.member_id': teacherUserId },
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
        userIdSet.add(assembly.chairman);
      }
      if (assembly.secretary) {
        userIdSet.add(assembly.secretary);
      }
      (assembly.members || []).forEach((member) => {
        if (member.member_id) {
          userIdSet.add(member.member_id);
        }
      });
    });

    const users = userIdSet.size
      ? await User.find({ user_id: { $in: Array.from(userIdSet) } }).select(
          'user_id user_name'
        )
      : [];
    const userMap = new Map(
      users.map((user) => [user.user_id, user.user_name])
    );

    const statusOutMap = {
      planning: 'scheduled',
      active: 'in_progress',
      completed: 'completed',
      cancelled: 'cancelled',
    };

    const data = assemblies.map((assembly) => {
      let role = 'member';
      if (assembly.chairman === teacherUserId) {
        role = 'chair';
      } else if (assembly.secretary === teacherUserId) {
        role = 'secretary';
      } else {
        const member = (assembly.members || []).find(
          (item) => item.member_id === teacherUserId
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
          name: member.member_name || userMap.get(member.member_id) || '',
          role: member.role,
        })),
        meeting_date: assembly.defense_date,
        location: assembly.defense_location,
        status: statusOutMap[assembly.assembly_status] || 'scheduled',
        description: assembly.assembly_description || '',
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
            students.push({
              student_id: member.student._id,
              student_name: member.student.user_name,
              student_code: member.student.user_id,
              progress: Math.random() * 100,
              topic_title: topic.topic_title,
              status: 'in_progress',
              last_submission: new Date(
                Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
              ),
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
      .populate('topic_group_student.student', 'user_name')
      .select(
        'topic_title topic_group_student rubric_instructor topic_registration_period created_at'
      )
      .sort({ created_at: -1 });

    const history = topics.map((topic) => ({
      _id: topic._id,
      topic_title: topic.topic_title,
      students_count: topic.topic_group_student?.length || 0,
      score: topic.rubric_instructor?.total_score || 0,
      status: topic.is_completed ? 'completed' : 'ongoing',
      category: topic.topic_category || '',
      academic_year: topic.topic_registration_period || '',
      completed_at: topic.updated_at,
    }));

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
  getTeachingHistory,
  downloadCertificate,
};
