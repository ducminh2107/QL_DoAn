const mongoose = require('mongoose');
const Topic = require('../../models/Topic');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

/**
 * @desc    Get students registered for teacher's topics
 * @route   GET /api/teacher/students/registrations
 * @access  Private/Teacher
 */
const getStudentRegistrations = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const teacherUserId = req.user.user_id;

    // Get all topics where teacher is instructor
    const topics = await Topic.find({
      topic_instructor: teacherId,
      is_active: true,
      topic_teacher_status: 'approved',
    }).select('_id topic_title');

    // Get all registrations for these topics
    const registrations = await Topic.aggregate([
      {
        $match: {
          topic_instructor: new mongoose.Types.ObjectId(teacherId),
          is_active: true,
          topic_teacher_status: 'approved',
        },
      },
      { $unwind: '$topic_group_student' },
      {
        $match: {
          'topic_group_student.status': 'pending',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'topic_group_student.student',
          foreignField: '_id',
          as: 'student_info',
        },
      },
      { $unwind: '$student_info' },
      {
        $project: {
          _id: 0,
          registration_id: '$_id',
          topic_id: '$_id',
          topic_title: '$topic_title',
          student_id: '$student_info._id',
          student_name: '$student_info.user_name',
          student_code: '$student_info.user_id',
          student_email: '$student_info.email',
          registration_date: '$topic_group_student.joined_at',
          status: '$topic_group_student.status',
          student_major: '$student_info.user_major',
          student_gpa: '$student_info.user_average_grade',
        },
      },
      { $sort: { registration_date: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: registrations.length,
      topics: topics,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve/reject student registration
 * @route   PUT /api/teacher/students/:studentId/registrations/:topicId
 * @access  Private/Teacher
 */
const handleRegistration = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { studentId, topicId } = req.params;
    const { action, feedback } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Hành động không hợp lệ',
      });
    }

    const topic = await Topic.findOne({
      _id: topicId,
      topic_instructor: teacherId,
      is_active: true,
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tìm thấy hoặc bạn không có quyền',
      });
    }

    // Find the student in topic group
    const studentIndex = topic.topic_group_student.findIndex(
      (member) => member.student.toString() === studentId
    );

    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Sinh viên không tìm thấy trong danh sách đăng ký',
      });
    }

    // Check if topic has available slots for approval
    if (action === 'approve') {
      const approvedCount = topic.topic_group_student.filter(
        (member) => member.status === 'approved'
      ).length;

      if (approvedCount >= topic.topic_max_members) {
        return res.status(400).json({
          success: false,
          message: 'Đề tài đã đầy, không thể thêm sinh viên',
        });
      }
    }

    // Update student status
    topic.topic_group_student[studentIndex].status =
      action === 'approve' ? 'approved' : 'rejected';

    const studentUser =
      await User.findById(studentId).select('user_id user_name');
    if (studentUser) {
      if (!topic.topic_group_student[studentIndex].student_id) {
        topic.topic_group_student[studentIndex].student_id =
          studentUser.user_id;
      }
      if (!topic.topic_group_student[studentIndex].student_name) {
        topic.topic_group_student[studentIndex].student_name =
          studentUser.user_name;
      }
    }

    // If approving, check if this makes the topic have a leader
    if (action === 'approve' && topic.topic_leader_status === 'pending') {
      topic.topic_leader_status = 'approved';
    }

    await topic.save();

    // Update student's registered_topics
    await User.findByIdAndUpdate(
      studentId,
      {
        $set: {
          'registered_topics.$[elem].status':
            action === 'approve' ? 'approved' : 'rejected',
          'registered_topics.$[elem].updated_at': new Date(),
        },
      },
      {
        arrayFilters: [{ 'elem.topic': topicId }],
      }
    );

    // If approving and student doesn't have current topic, set it
    if (action === 'approve') {
      const student = await User.findById(studentId);
      if (!student.current_topic) {
        student.current_topic = topicId;
        await student.save();
      }
    }

    const studentUserForNotification =
      await User.findById(studentId).select('user_id');

    // Create notification
    await Notification.create({
      user_notification_title: `Đăng ký đề tài "${topic.topic_title}" đã được ${action === 'approve' ? 'chấp nhận' : 'từ chối'}`,
      user_notification_sender: teacherUserId,
      user_notification_recipient: studentUserForNotification?.user_id || '',
      user_notification_content:
        feedback ||
        `Giảng viên đã ${action === 'approve' ? 'chấp nhận' : 'từ chối'} đăng ký của bạn.`,
      user_notification_type: 'system',
    });

    // Get updated topic with populated data
    const updatedTopic = await Topic.findById(topicId).populate(
      'topic_group_student.student',
      'user_name user_id'
    );

    res.status(200).json({
      success: true,
      message: `Đã ${action === 'approve' ? 'chấp nhận' : 'từ chối'} đăng ký của sinh viên`,
      data: {
        topic: updatedTopic,
        student_id: studentId,
        status: action === 'approve' ? 'approved' : 'rejected',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove student from topic (even if approved)
 * @route   DELETE /api/teacher/students/:studentId/topics/:topicId
 * @access  Private/Teacher
 */
const removeStudentFromTopic = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { studentId, topicId } = req.params;
    const { reason } = req.body;

    const topic = await Topic.findOne({
      _id: topicId,
      topic_instructor: teacherId,
      is_active: true,
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tìm thấy hoặc bạn không có quyền',
      });
    }

    // Remove student from topic
    topic.topic_group_student = topic.topic_group_student.filter(
      (member) => member.student.toString() !== studentId
    );

    await topic.save();

    // Remove topic from student's registered_topics
    await User.findByIdAndUpdate(studentId, {
      $pull: { registered_topics: { topic: topicId } },
      $unset: { current_topic: '' },
    });

    // Create notification
    await Notification.create({
      user_notification_title: `Bạn đã bị xóa khỏi đề tài "${topic.topic_title}"`,
      user_notification_sender: teacherUserId,
      user_notification_recipient: studentUser?.user_id || '',
      user_notification_content: reason || 'Giảng viên đã xóa bạn khỏi đề tài.',
      user_notification_type: 'system',
    });

    res.status(200).json({
      success: true,
      message: 'Đã xóa sinh viên khỏi đề tài',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students currently guided by teacher
 * @route   GET /api/teacher/students/guided
 * @access  Private/Teacher
 */
const getGuidedStudents = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    // Get topics where teacher is instructor and have approved students
    const topics = await Topic.find({
      topic_instructor: teacherId,
      is_active: true,
      topic_teacher_status: 'approved',
      'topic_group_student.status': 'approved',
    })
      .populate(
        'topic_group_student.student',
        'user_name user_id email user_phone user_major user_average_grade'
      )
      .select('topic_title topic_max_members topic_group_student');

    // Format data
    const guidedStudents = topics.reduce((acc, topic) => {
      const approvedStudents = topic.topic_group_student.filter(
        (member) => member.status === 'approved'
      );

      approvedStudents.forEach((member) => {
        acc.push({
          topic_id: topic._id,
          topic_title: topic.topic_title,
          topic_max_members: topic.topic_max_members,
          ...member.student._doc,
          joined_at: member.joined_at,
        });
      });

      return acc;
    }, []);

    // Group by topic for statistics
    const stats = {
      total_students: guidedStudents.length,
      total_topics: topics.length,
      topics: topics.map((topic) => ({
        topic_id: topic._id,
        topic_title: topic.topic_title,
        student_count: topic.topic_group_student.filter(
          (m) => m.status === 'approved'
        ).length,
        max_members: topic.topic_max_members,
      })),
    };

    res.status(200).json({
      success: true,
      stats,
      data: guidedStudents,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentRegistrations,
  handleRegistration,
  removeStudentFromTopic,
  getGuidedStudents,
};
