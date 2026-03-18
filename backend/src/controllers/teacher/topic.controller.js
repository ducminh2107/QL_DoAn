const mongoose = require('mongoose');
const Topic = require('../../models/Topic');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const RegistrationPeriod = require('../../models/RegistrationPeriod');
const { sanitizeUser, getPagination } = require('../../utils/helpers');

/**
 * @desc    Get teacher's topics (created or assigned)
 * @route   GET /api/teacher/topics
 * @access  Private/Teacher
 */
const getTeacherTopics = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    console.log(`🔍 getTeacherTopics called for ${teacherId}`);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query - topics where teacher is instructor or creator
    let query = {
      $or: [{ topic_instructor: teacherId }, { topic_creator: teacherId }],
      is_active: true,
    };

    // Filter by status
    if (req.query.status) {
      if (req.query.status === 'my_created') {
        query = { topic_creator: teacherId, is_active: true };
      } else if (req.query.status === 'my_guided') {
        query = { topic_instructor: teacherId, is_active: true };
      } else if (req.query.status === 'pending_approval') {
        query.topic_teacher_status = { $nin: ['rejected'] };
        query.topic_leader_status = 'pending'; // strictly only pending, not rejected or approved
        query.is_completed = false;
      } else if (req.query.status === 'rejected') {
        query.topic_leader_status = 'rejected';
      } else if (req.query.status === 'approved') {
        query.topic_teacher_status = 'approved';
        query.topic_leader_status = 'approved';
      } else if (req.query.status === 'in_progress') {
        query.topic_teacher_status = 'approved';
        query.topic_leader_status = 'approved';
        query.is_completed = false;
      } else if (req.query.status === 'completed') {
        query.is_completed = true;
      }
    }

    // Search filter
    if (req.query.search) {
      query.$or = [
        { topic_title: { $regex: req.query.search, $options: 'i' } },
        { topic_description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [topics, total] = await Promise.all([
      Topic.find(query)
        .populate('topic_category', 'topic_category_title')
        .populate('topic_major', 'major_title')
        .populate('topic_creator', 'user_name user_id')
        .populate('topic_group_student.student', 'user_name user_id')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Topic.countDocuments(query),
    ]);

    // Add statistics
    const stats = {
      total: total,
      my_created: await Topic.countDocuments({
        topic_creator: teacherId,
        is_active: true,
      }),
      my_guided: await Topic.countDocuments({
        topic_instructor: teacherId,
        is_active: true,
      }),
      pending_approval: await Topic.countDocuments({
        topic_instructor: teacherId,
        topic_teacher_status: { $nin: ['rejected'] },
        topic_leader_status: 'pending', // strictly pending only, NOT rejected
        is_completed: false,
        is_active: true,
      }),
      in_progress: await Topic.countDocuments({
        topic_instructor: teacherId,
        topic_teacher_status: 'approved',
        topic_leader_status: 'approved',
        is_completed: false,
        is_active: true,
      }),
      completed: await Topic.countDocuments({
        topic_instructor: teacherId,
        is_completed: true,
      }),
    };

    const pagination = getPagination(page, limit, total);

    res.status(200).json({
      success: true,
      stats,
      pagination,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single topic (teacher)
 * @route   GET /api/teacher/topics/:id
 * @access  Private/Teacher
 */
const getTopicById = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const topicId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        success: false,
        message: 'ID đề tài không hợp lệ',
      });
    }

    const topic = await Topic.findOne({
      _id: topicId,
      $or: [{ topic_creator: teacherId }, { topic_instructor: teacherId }],
    })
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title')
      .populate('topic_creator', 'user_name user_id email')
      .populate('topic_group_student.student', 'user_name user_id');

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tồn tại hoặc bạn không có quyền truy cập',
      });
    }

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new topic (teacher)
 * @route   POST /api/teacher/topics
 * @access  Private/Teacher
 */
const createTopic = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const teacher = await User.findById(teacherId);

    const {
      topic_title,
      topic_description,
      topic_category,
      topic_major,
      topic_max_members = 1,
      topic_advisor_request,
    } = req.body;

    let registrationPeriodId = req.body.topic_registration_period;

    // Nếu frontend gửi chuỗi là mã học kỳ thay vì ObjectId
    if (
      registrationPeriodId &&
      !mongoose.Types.ObjectId.isValid(registrationPeriodId)
    ) {
      const matchingPeriod = await RegistrationPeriod.findOne({
        registration_period_semester: registrationPeriodId,
      });
      if (matchingPeriod) {
        registrationPeriodId = matchingPeriod._id;
      } else {
        registrationPeriodId = null;
      }
    }

    if (!registrationPeriodId) {
      const activePeriod = await RegistrationPeriod.findOne({
        registration_period_status: 'active',
      });
      if (activePeriod) {
        registrationPeriodId = activePeriod._id;
      }
    }

    // Create topic with teacher as instructor and auto-approved
    const topic = await Topic.create({
      topic_title,
      topic_description,
      topic_category,
      topic_major: topic_major || teacher.user_major || topic_category,
      topic_registration_period: registrationPeriodId,
      topic_creator: teacherId,
      topic_instructor: teacherId,
      topic_max_members,
      topic_advisor_request,
      topic_teacher_status: 'approved', // Teacher-created topics auto-approved
      topic_leader_status: 'pending',
      is_active: true,
      milestones: [
        {
          name: 'Nộp đề cương',
          description:
            'Chuẩn bị và nộp đề cương chi tiết cho giảng viên hướng dẫn',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
          status: 'pending',
        },
        {
          name: 'Phân tích & Thiết kế',
          description: 'Thực hiện phân tích yêu cầu và thiết kế hệ thống',
          due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
          status: 'pending',
        },
        {
          name: 'Xây dựng & Thử nghiệm',
          description: 'Phát triển phần mềm và thực hiện kiểm thử',
          due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months
          status: 'pending',
        },
        {
          name: 'Nộp báo cáo cuối kỳ',
          description: 'Hoàn thiện quyển báo cáo và các tài liệu liên quan',
          due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
          status: 'pending',
        },
      ],
    });

    // Populate for response
    const populatedTopic = await Topic.findById(topic._id)
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title');

    res.status(201).json({
      success: true,
      message: 'Tạo đề tài thành công',
      data: populatedTopic,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update topic (teacher can update their topics)
 * @route   PUT /api/teacher/topics/:id
 * @access  Private/Teacher
 */
const updateTopic = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const topicId = req.params.id;

    const topic = await Topic.findOne({
      _id: topicId,
      $or: [{ topic_creator: teacherId }, { topic_instructor: teacherId }],
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tồn tại hoặc bạn không có quyền chỉnh sửa',
      });
    }

    // Check if topic has approved students (cannot change max_members)
    const approvedStudents = topic.topic_group_student.filter(
      (member) => member.status === 'approved'
    ).length;

    const allowedUpdates = [
      'topic_title',
      'topic_description',
      'topic_category',
      'topic_major',
      'topic_advisor_request',
      'teacher_notes',
    ];

    // Only allow max_members update if no approved students
    if (approvedStudents === 0) {
      allowedUpdates.push('topic_max_members');
    }

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        topic[field] = req.body[field];
      }
    });

    await topic.save();

    const updatedTopic = await Topic.findById(topicId)
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title')
      .populate('topic_group_student.student', 'user_name user_id');

    res.status(200).json({
      success: true,
      message: 'Cập nhật đề tài thành công',
      data: updatedTopic,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete topic (only if no approved students)
 * @route   DELETE /api/teacher/topics/:id
 * @access  Private/Teacher
 */
const deleteTopic = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const topicId = req.params.id;

    const topic = await Topic.findOne({
      _id: topicId,
      topic_creator: teacherId,
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Chỉ người tạo đề tài mới có thể xóa',
      });
    }

    // Check if topic has any approved students
    const hasApprovedStudents = topic.topic_group_student.some(
      (member) => member.status === 'approved'
    );

    if (hasApprovedStudents) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa đề tài đã có sinh viên được duyệt',
      });
    }

    // Soft delete
    topic.is_active = false;
    await topic.save();

    res.status(200).json({
      success: true,
      message: 'Đã xóa đề tài',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get topics pending teacher approval
 * @route   GET /api/teacher/topics/pending-approval
 * @access  Private/Teacher
 */
const getPendingApprovalTopics = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const teacher = await User.findById(teacherId);

    // Get topics where teacher is instructor and status is pending
    const topics = await Topic.find({
      topic_instructor: teacherId,
      topic_teacher_status: 'pending',
      is_active: true,
    })
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title')
      .populate('topic_creator', 'user_name user_id email')
      .populate('topic_group_student.student', 'user_name user_id')
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve/reject student-proposed topic
 * @route   PUT /api/teacher/topics/:id/approve
 * @access  Private/Teacher
 */
const approveTopic = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const topicId = req.params.id;
    const { status, feedback } = req.body;

    if (!['approved', 'rejected', 'need_revision'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: approved, rejected, need_revision',
      });
    }

    // Find topic—for need_revision, also allow already pending topics
    const topicQuery = {
      _id: topicId,
      topic_instructor: teacherId,
      is_active: true,
    };
    if (status !== 'need_revision') {
      topicQuery.topic_teacher_status = 'pending';
    }

    const topic = await Topic.findOne(topicQuery);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tìm thấy hoặc không cần duyệt',
      });
    }

    topic.topic_teacher_status = status;
    topic.teacher_notes = feedback || '';

    // If approved, also approve the creator (student) as first member
    if (status === 'approved') {
      const creatorMember = topic.topic_group_student.find(
        (member) => member.student.toString() === topic.topic_creator.toString()
      );
      if (creatorMember) {
        creatorMember.status = 'approved';
      }
    }

    await topic.save();

    let title = '';
    let content = feedback || '';

    if (status === 'approved') {
      title = `✅ Đề tài "${topic.topic_title}" đã được Giảng viên duyệt`;
      content =
        content ||
        'Giảng viên đã đồng ý hướng dẫn đề tài của bạn. Hệ thống đã chuyển đề tài lên cấp Khoa/Quản trị viên để chờ xét duyệt cuối cùng.';
    } else if (status === 'rejected') {
      title = `❌ Đề tài "${topic.topic_title}" bị Giảng viên từ chối`;
      content = content || 'Giảng viên đã từ chối hướng dẫn đề tài của bạn.';
    } else {
      title = `⚠️ Đề tài "${topic.topic_title}" cần chỉnh sửa`;
      content = content || 'Giảng viên yêu cầu bạn chỉnh sửa lại đề tài.';
    }

    await Notification.create({
      user_notification_title: title,
      user_notification_sender: req.user.id,
      user_notification_recipient: topic.topic_creator,
      user_notification_content: content,
      user_notification_type: 'system',
    });

    const updatedTopic = await Topic.findById(topicId).populate(
      'topic_creator',
      'user_name user_id email'
    );

    res.status(200).json({
      success: true,
      message: `Đã ${
        status === 'approved'
          ? 'duyệt (đang chờ Khoa duyệt)'
          : status === 'rejected'
          ? 'từ chối'
          : 'yêu cầu chỉnh sửa'
      } đề tài`,
      data: updatedTopic,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeacherTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  getPendingApprovalTopics,
  approveTopic,
};
