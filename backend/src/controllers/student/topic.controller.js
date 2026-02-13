const mongoose = require('mongoose');
// Đảm bảo các model được đăng ký với Mongoose trước khi populate
require('../../models/TopicCategory');
require('../../models/Major');
const Topic = require('../../models/Topic');
const User = require('../../models/User');
const RegistrationPeriod = require('../../models/RegistrationPeriod');
const { sanitizeUser, getPagination } = require('../../utils/helpers');

/**
 * @desc    Get all available topics for student
 * @route   GET /api/student/topics
 * @access  Private/Student
 */
const getAvailableTopics = async (req, res, next) => {
  try {
    const student = await User.findById(req.user.id).populate('user_major');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Sinh viên không tồn tại',
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {
      is_active: true,
      topic_teacher_status: 'approved',
      topic_leader_status: 'approved',
    };

    // Filter by major
    // Chỉ áp dụng nếu user_major là ObjectId hợp lệ,
    // tránh lỗi CastError khi user_major đang lưu dạng string (ví dụ “Kỹ thuật phần mềm”)
    if (
      student.user_major &&
      mongoose.Types.ObjectId.isValid(student.user_major)
    ) {
      query.topic_major = student.user_major;
    }

    // Search filter
    if (req.query.search) {
      query.$or = [
        { topic_title: { $regex: req.query.search, $options: 'i' } },
        { topic_description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Category filter
    if (req.query.category) {
      query.topic_category = req.query.category;
    }

    // Instructor filter
    if (req.query.instructor) {
      query.topic_instructor = req.query.instructor;
    }

    // Get active registration period
    const activePeriod = await RegistrationPeriod.findOne({
      registration_period_status: 'active',
      registration_period_start: { $lte: new Date() },
      registration_period_end: { $gte: new Date() },
    });

    if (activePeriod) {
      query.$or = [
        {
          topic_registration_period: activePeriod.registration_period_semester,
        },
        { topic_registration_period_ref: activePeriod._id },
      ];
    }

    // Execute query with population
    const [topics, total] = await Promise.all([
      Topic.find(query)
        .populate('topic_category', 'topic_category_title')
        .populate('topic_major', 'major_title')
        .populate('topic_creator', 'user_name email user_id')
        .populate('topic_instructor', 'user_name email user_id')
        .populate('topic_group_student.student', 'user_name user_id')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Topic.countDocuments(query),
    ]);

    // Add virtual fields
    const topicsWithSlots = topics.map((topic) => ({
      ...topic.toObject(),
      available_slots: topic.available_slots,
      has_available_slots: topic.has_available_slots,
      is_full: topic.is_full,
      student_registration_status: getStudentRegistrationStatus(
        topic,
        req.user.id
      ),
    }));

    // Pagination metadata
    const pagination = getPagination(page, limit, total);

    res.status(200).json({
      success: true,
      count: topics.length,
      pagination,
      data: topicsWithSlots,
      filters: {
        search: req.query.search || '',
        category: req.query.category || '',
        instructor: req.query.instructor || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single topic details
 * @route   GET /api/student/topics/:id
 * @access  Private/Student
 */
const getTopicById = async (req, res, next) => {
  try {
    // Validate id to tránh CastError khi id không phải ObjectId (ví dụ: 'propose')
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID đề tài không hợp lệ',
      });
    }

    const topic = await Topic.findById(req.params.id)
      .populate(
        'topic_category',
        'topic_category_title topic_category_description'
      )
      .populate('topic_major', 'major_title major_description')
      .populate('topic_creator', 'user_name email user_id user_avatar')
      .populate(
        'topic_instructor',
        'user_name email user_id user_phone user_avatar'
      )
      .populate('topic_reviewer', 'user_name email user_id')
      .populate('topic_group_student.student', 'user_name user_id user_avatar')
      .populate('topic_assembly', 'assembly_name')
      .populate('rubric_instructor.rubric_id', 'rubric_name')
      .populate('rubric_reviewer.rubric_id', 'rubric_name')
      .populate('rubric_assembly.rubric_id', 'rubric_name');

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tồn tại',
      });
    }

    // Check if student is in this topic
    const isMember = topic.topic_group_student.some(
      (member) =>
        member.student &&
        member.student._id &&
        member.student._id.toString() === req.user.id &&
        member.status === 'approved'
    );

    // Check if student has pending request
    const hasPendingRequest = topic.topic_group_student.some(
      (member) =>
        member.student &&
        member.student._id &&
        member.student._id.toString() === req.user.id &&
        member.status === 'pending'
    );

    const topicData = {
      ...topic.toObject(),
      available_slots: topic.available_slots,
      has_available_slots: topic.has_available_slots,
      is_full: topic.is_full,
      student_info: {
        is_member: isMember,
        has_pending_request: hasPendingRequest,
        can_register:
          !isMember && !hasPendingRequest && topic.has_available_slots,
      },
    };

    res.status(200).json({
      success: true,
      data: topicData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register for a topic
 * @route   POST /api/student/topics/:id/register
 * @access  Private/Student
 */
const registerForTopic = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Get student info
    const student = await User.findById(studentId);

    // Check active registration period
    const activePeriod = await RegistrationPeriod.findOne({
      registration_period_status: 'active',
      registration_period_start: { $lte: new Date() },
      registration_period_end: { $gte: new Date() },
    });

    if (!activePeriod) {
      console.log('DEBUG: No active registration period found');
      return res.status(400).json({
        success: false,
        message: 'Hiện không có đợt đăng ký nào đang diễn ra',
      });
    }

    // Check if student can register in this period
    if (
      !activePeriod.canStudentRegister(student.user_major, student.user_faculty)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không được đăng ký trong đợt này',
      });
    }

    // Check max registrations per student
    const studentRegistrations = await Topic.countDocuments({
      'topic_group_student.student': studentId,
      'topic_group_student.status': { $in: ['pending', 'approved'] },
    });

    if (studentRegistrations >= activePeriod.max_topics_per_student) {
      return res.status(400).json({
        success: false,
        message: `Bạn đã đăng ký tối đa ${activePeriod.max_topics_per_student} đề tài`,
      });
    }

    // Get topic
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tồn tại',
      });
    }

    // Check if topic is available
    if (!topic.is_active || topic.topic_teacher_status !== 'approved') {
      console.log('DEBUG: Topic not approved or inactive', {
        active: topic.is_active,
        status: topic.topic_teacher_status,
      });
      return res.status(400).json({
        success: false,
        message: 'Đề tài không khả dụng để đăng ký',
      });
    }

    // Check if topic has available slots
    if (!topic.has_available_slots) {
      return res.status(400).json({
        success: false,
        message: 'Đề tài đã đầy',
      });
    }

    // Check if student is already registered
    const existingRegistration = topic.topic_group_student.find(
      (member) => member.student.toString() === studentId
    );

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message:
          existingRegistration.status === 'pending'
            ? 'Bạn đã có yêu cầu đăng ký chờ duyệt'
            : 'Bạn đã là thành viên của đề tài này',
      });
    }

    // Add student to topic group
    topic.topic_group_student.push({
      student: studentId,
      student_id: student.user_id,
      student_name: student.user_name,
      status: 'pending',
      joined_at: new Date(),
    });

    await topic.save();

    // Update student's registered topics
    await User.findByIdAndUpdate(studentId, {
      $push: {
        registered_topics: {
          topic: topic._id,
          status: 'pending',
          registered_at: new Date(),
        },
      },
    });

    // Populate for response
    const updatedTopic = await Topic.findById(topic._id)
      .populate('topic_category', 'topic_category_title')
      .populate('topic_creator', 'user_name')
      .populate('topic_group_student.student', 'user_name user_id');

    res.status(200).json({
      success: true,
      message: 'Đăng ký đề tài thành công. Chờ giảng viên duyệt.',
      data: {
        topic: updatedTopic,
        registration_status: 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel topic registration
 * @route   DELETE /api/student/topics/:id/register
 * @access  Private/Student
 */
const cancelRegistration = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const topicId = req.params.id;

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tồn tại',
      });
    }

    // Find student registration
    const studentIndex = topic.topic_group_student.findIndex(
      (member) => member.student.toString() === studentId
    );

    if (studentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa đăng ký đề tài này',
      });
    }

    // Check if registration is already approved
    if (topic.topic_group_student[studentIndex].status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đăng ký khi đã được duyệt. Liên hệ giảng viên.',
      });
    }

    // Remove student from topic
    topic.topic_group_student.splice(studentIndex, 1);
    await topic.save();

    // Update student's registered topics
    await User.findByIdAndUpdate(studentId, {
      $pull: {
        registered_topics: {
          topic: topicId,
          status: { $in: ['pending', 'rejected'] },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Hủy đăng ký thành công',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Propose new topic
 * @route   POST /api/student/topics/propose
 * @access  Private/Student
 */
const proposeTopic = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);

    // Check active registration period
    const activePeriod = await RegistrationPeriod.findOne({
      registration_period_status: 'active',
      allow_proposal: true,
      registration_period_start: { $lte: new Date() },
      registration_period_end: { $gte: new Date() },
    });

    if (!activePeriod) {
      console.log('DEBUG: No active registration (proposal) period found');
      return res.status(400).json({
        success: false,
        message: 'Hiện không thể đề xuất đề tài mới',
      });
    }

    // Validate proposal data
    const {
      topic_title,
      topic_description,
      topic_category,
      topic_max_members = 1,
      topic_advisor_request,
    } = req.body;

    // Xử lý topic_major (nếu User đang lưu major dạng String thì cần tìm ObjectId tương ứng)
    let topicMajorId = student.user_major;
    if (topicMajorId && !mongoose.Types.ObjectId.isValid(topicMajorId)) {
      const Major = mongoose.model('Major');
      const foundMajor = await Major.findOne({
        $or: [{ major_title: topicMajorId }, { major_code: topicMajorId }],
      });
      if (foundMajor) {
        topicMajorId = foundMajor._id;
      } else {
        // Fallback: Nếu không tìm thấy, để null hoặc báo lỗi tùy logic.
        // Ở đây để Topic validator báo lỗi nếu required
        topicMajorId = undefined;
      }
    }

    // Xử lý topic_instructor (Tìm giảng viên nếu sinh viên có ghi tên/mã GV)
    let topicInstructorId = undefined;
    if (topic_advisor_request) {
      // Tìm giáo viên khớp với tên (không phân biệt hoa thường) hoặc mã GV
      const foundTeacher = await User.findOne({
        role: 'teacher',
        $or: [
          { user_name: { $regex: new RegExp(topic_advisor_request, 'i') } },
          { user_id: topic_advisor_request },
        ],
      });
      if (foundTeacher) {
        topicInstructorId = foundTeacher._id;
      }
    }

    // Create new topic
    const newTopic = await Topic.create({
      topic_registration_period: activePeriod.registration_period_semester,
      topic_registration_period_ref: activePeriod._id,
      topic_title,
      topic_description,
      topic_category,
      topic_major: topicMajorId,
      topic_instructor: topicInstructorId, // Gán ID giảng viên để họ thấy đề tài
      topic_creator: studentId,
      topic_creator_id: student.user_id,
      topic_max_members,
      topic_advisor_request,
      topic_teacher_status: 'pending',
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

    // Add creator as first member (pending approval)
    newTopic.topic_group_student.push({
      student: studentId,
      student_id: student.user_id,
      student_name: student.user_name,
      status: 'pending',
      joined_at: new Date(),
    });

    await newTopic.save();

    // Update student's proposed topics
    await User.findByIdAndUpdate(studentId, {
      $push: { proposed_topics: newTopic._id },
    });

    // Populate for response
    const populatedTopic = await Topic.findById(newTopic._id)
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title')
      .populate('topic_creator', 'user_name user_id');

    res.status(201).json({
      success: true,
      message: 'Đề xuất đề tài thành công. Chờ giảng viên duyệt.',
      data: populatedTopic,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update proposed topic (if not approved yet)
 * @route   PUT /api/student/topics/:id
 * @access  Private/Student
 */
const updateProposedTopic = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const topicId = req.params.id;

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tồn tại',
      });
    }

    // Check if student is the creator
    if (topic.topic_creator.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người tạo đề tài mới có thể chỉnh sửa',
      });
    }

    // Check if topic is already approved/rejected
    if (topic.topic_teacher_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Không thể chỉnh sửa đề tài đã được duyệt/từ chối',
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'topic_title',
      'topic_description',
      'topic_category',
      'topic_max_members',
      'topic_advisor_request',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        topic[field] = req.body[field];
      }
    });

    topic.updated_at = new Date();
    await topic.save();

    // Populate for response
    const updatedTopic = await Topic.findById(topic._id)
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title');

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
 * @desc    Delete proposed topic
 * @route   DELETE /api/student/topics/:id
 * @access  Private/Student
 */
const deleteProposedTopic = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const topicId = req.params.id;

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tồn tại',
      });
    }

    // Check if student is the creator
    if (topic.topic_creator.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người tạo đề tài mới có thể xóa',
      });
    }

    // Check if topic is already approved
    if (topic.topic_teacher_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa đề tài đã được duyệt',
      });
    }

    // Delete topic
    await topic.deleteOne();

    // Remove from student's proposed topics
    await User.findByIdAndUpdate(studentId, {
      $pull: { proposed_topics: topicId },
    });

    res.status(200).json({
      success: true,
      message: 'Xóa đề tài thành công',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's current topic
 * @route   GET /api/student/my-topic
 * @access  Private/Student
 */
const getMyTopic = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Find topic where student is a member (prefer approved over pending)
    const topic = await Topic.findOne({
      'topic_group_student.student': studentId,
      'topic_group_student.status': { $in: ['approved', 'pending'] },
      is_active: true,
    })
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title')
      .populate('topic_creator', 'user_name user_id')
      .populate('topic_instructor', 'user_name email user_phone')
      .populate('topic_reviewer', 'user_name email')
      .populate('topic_group_student.student', 'user_name user_id user_avatar')
      .populate('rubric_instructor.rubric_id', 'rubric_name')
      .populate('rubric_reviewer.rubric_id', 'rubric_name')
      .populate('rubric_assembly.rubric_id', 'rubric_name')
      .sort({ 'topic_group_student.status': 1 }); // Sort status to get 'approved' before 'pending' if somehow both exist (rare)

    if (!topic) {
      return res.status(200).json({
        success: true,
        message: 'Bạn chưa có đề tài nào đang đăng ký hoặc được duyệt',
        data: null,
      });
    }

    // Get student's specific status in this topic
    const studentMember = topic.topic_group_student.find(
      (member) =>
        member.student?._id?.toString() === studentId ||
        member.student?.toString() === studentId
    );

    const topicData = {
      ...topic.toObject(),
      my_status: studentMember ? studentMember.status : null,
      my_joined_at: studentMember ? studentMember.joined_at : null,
      available_slots: topic.available_slots,
    };

    res.status(200).json({
      success: true,
      data: topicData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's topic progress
 * @route   GET /api/student/topics/:id/progress
 * @access  Private/Student
 */
const getTopicProgress = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const topicId = req.params.id;

    // Check if student is member of this topic
    const topic = await Topic.findOne({
      _id: topicId,
      'topic_group_student.student': studentId,
      'topic_group_student.status': 'approved',
    });

    if (!topic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải thành viên của đề tài này',
      });
    }

    // In real implementation, you would have a Progress model
    // For now, return mock progress
    const progress = {
      topic_id: topic._id,
      topic_title: topic.topic_title,
      milestones: [
        {
          name: 'Đề cương đề tài',
          status: 'completed',
          due_date: new Date('2024-03-01'),
          completed_date: new Date('2024-02-28'),
          comment: 'Đã duyệt',
        },
        {
          name: 'Báo cáo tiến độ 1',
          status: 'in_progress',
          due_date: new Date('2024-04-15'),
          completed_date: null,
          comment: 'Đang thực hiện',
        },
        {
          name: 'Báo cáo tiến độ 2',
          status: 'pending',
          due_date: new Date('2024-05-30'),
          completed_date: null,
          comment: 'Chưa bắt đầu',
        },
        {
          name: 'Báo cáo cuối',
          status: 'pending',
          due_date: new Date('2024-07-15'),
          completed_date: null,
          comment: 'Chưa bắt đầu',
        },
        {
          name: 'Bảo vệ đề tài',
          status: 'pending',
          due_date: new Date('2024-08-01'),
          completed_date: null,
          comment: 'Chưa bắt đầu',
        },
      ],
      overall_progress: 20,
      next_deadline: new Date('2024-04-15'),
      instructor_feedback: topic.topic_advisor_request || 'Chưa có nhận xét',
    };

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all topics student is participating in with progress
 * @route   GET /api/student/topics-progress
 * @access  Private/Student
 */
const getTopicsProgress = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const topics = await Topic.find({
      'topic_group_student.student': studentId,
      'topic_group_student.status': { $in: ['approved', 'pending'] },
      is_active: true,
    })
      .populate('topic_instructor', 'user_name email')
      .select(
        'topic_title topic_description milestones progress teacher_notes topic_instructor'
      );

    const formattedTopics = await Promise.all(
      topics.map(async (topic) => {
        // Auto-inject milestones if missing (to fix user's issue)
        if (!topic.milestones || topic.milestones.length === 0) {
          topic.milestones = [
            {
              name: 'Nộp đề cương',
              description:
                'Chuẩn bị và nộp đề cương chi tiết cho giảng viên hướng dẫn',
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              status: 'pending',
            },
            {
              name: 'Phân tích & Thiết kế',
              description: 'Thực hiện phân tích yêu cầu và thiết kế hệ thống',
              due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
              status: 'pending',
            },
            {
              name: 'Xây dựng & Thử nghiệm',
              description: 'Phát triển phần mềm và thực hiện kiểm thử',
              due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              status: 'pending',
            },
            {
              name: 'Nộp báo cáo cuối kỳ',
              description: 'Hoàn thiện quyển báo cáo và các tài liệu liên quan',
              due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              status: 'pending',
            },
          ];
          await topic.save();
        }

        // Calculate overall progress based on milestones
        let overallProgress = 0;
        if (topic.milestones && topic.milestones.length > 0) {
          const completedMilestones = topic.milestones.filter(
            (m) => m.status === 'completed'
          ).length;
          overallProgress = Math.round(
            (completedMilestones / topic.milestones.length) * 100
          );
        }

        return {
          _id: topic._id,
          topic_title: topic.topic_title,
          description: topic.topic_description,
          teacher_name: topic.topic_instructor?.user_name,
          progress: overallProgress,
          milestones: topic.milestones || [],
          notes: topic.teacher_notes || '',
        };
      })
    );

    res.status(200).json({
      success: true,
      data: formattedTopics,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function
const getStudentRegistrationStatus = (topic, studentId) => {
  const registration = topic.topic_group_student.find(
    (member) =>
      member.student &&
      member.student._id &&
      member.student._id.toString() === studentId
  );

  if (!registration) return 'not_registered';
  return registration.status;
};

/**
 * @desc    Get student's registered topics (My Topics)
 * @route   GET /api/student/my-topics
 * @access  Private/Student
 */
const getMyTopics = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const topics = await Topic.find({
      topic_group_student: {
        $elemMatch: { student: studentId },
      },
    })
      .populate('topic_instructor', 'user_name email user_id')
      .populate('topic_category', 'topic_category_title')
      .select(
        'topic_title topic_description topic_instructor topic_teacher_status topic_category topic_group_student created_at'
      );

    res.status(200).json({
      success: true,
      data: topics.map((topic) => {
        const member = (topic.topic_group_student || []).find(
          (m) => m.student && m.student.toString() === studentId
        );
        return {
          _id: topic._id,
          topic_title: topic.topic_title,
          description: topic.topic_description,
          teacher_name: topic.topic_instructor?.user_name,
          status: member?.status || topic.topic_teacher_status || 'pending',
          category: topic.topic_category?.topic_category_title || '',
          created_at: topic.created_at,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student grades
 * @route   GET /api/student/grades
 * @access  Private/Student
 */
const getGrades = async (req, res, next) => {
  try {
    const studentId = req.user.user_id;
    const Scoreboard = require('../../models/Scoreboard');

    const grades = await Scoreboard.find({ student_id: studentId }).populate(
      'topic_id',
      'topic_title'
    );

    const graderIds = [
      ...new Set(
        grades.map((grade) => grade.grader).filter((grader) => !!grader)
      ),
    ];

    const graders = graderIds.length
      ? await User.find({ user_id: { $in: graderIds } }).select(
          'user_id user_name'
        )
      : [];

    const graderMap = new Map(
      graders.map((grader) => [grader.user_id, grader.user_name])
    );

    const gradesData = grades.map((grade) => ({
      _id: grade._id,
      topic_title: grade.topic_id?.topic_title,
      final_score: grade.total_score || 0,
      rubric_scores: grade.rubric_student_evaluations || [],
      evaluator: graderMap.get(grade.grader) || '',
      feedback: '',
      student_grades: grade.student_grades || '',
      created_at: grade.created_at,
    }));

    res.status(200).json({
      success: true,
      data: gradesData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get registration history
 * @route   GET /api/student/registration-history
 * @access  Private/Student
 */
const getRegistrationHistory = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const topics = await Topic.find({
      'topic_group_student.student': studentId,
    })
      .populate('topic_instructor', 'user_name user_id')
      .populate('topic_category', 'topic_category_title')
      .select(
        'topic_title topic_registration_period topic_category topic_group_student created_at'
      )
      .sort({ created_at: -1 });

    const historyData = topics.map((topic) => {
      const member = (topic.topic_group_student || []).find(
        (m) => m.student && m.student.toString() === studentId
      );
      return {
        _id: topic._id,
        semester: topic.topic_registration_period || '',
        semester_name: topic.topic_registration_period || '',
        topic_title: topic.topic_title,
        teacher_name: topic.topic_instructor?.user_name,
        status: member?.status || 'pending',
        topic_category: topic.topic_category?.topic_category_title || '',
        created_at: member?.joined_at || topic.created_at,
      };
    });

    res.status(200).json({
      success: true,
      data: historyData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student dashboard statistics
 * @route   GET /api/student/statistics
 * @access  Private/Student
 */
const getStatistics = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Total topics available (in active period)
    const totalTopicsCount = await Topic.countDocuments({
      is_active: true,
      topic_teacher_status: 'approved',
      topic_leader_status: 'approved',
    });

    // My registered topics (pending or approved)
    const registeredTopicsCount = await Topic.countDocuments({
      'topic_group_student.student': studentId,
      is_active: true,
    });

    // My topic (prefer approved, then pending)
    const myTopic = await Topic.findOne({
      'topic_group_student.student': studentId,
      'topic_group_student.status': { $in: ['approved', 'pending'] },
      is_active: true,
    }).sort({ 'topic_group_student.status': 1 }); // 'approved' comes before 'pending'

    // Count completed milestones and calculate percentage
    let completedMilestones = 0;
    let progressPercentage = 0;
    if (myTopic && myTopic.milestones && myTopic.milestones.length > 0) {
      completedMilestones = myTopic.milestones.filter(
        (m) => m.status === 'completed'
      ).length;
      progressPercentage = Math.round(
        (completedMilestones / myTopic.milestones.length) * 100
      );
    }

    res.status(200).json({
      success: true,
      data: {
        total_topics: totalTopicsCount,
        registered_topics: registeredTopicsCount,
        completed_milestones: completedMilestones,
        progress_percentage: progressPercentage,
        pending_tasks: 0, // Placeholder
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit work for a milestone
 * @route   PUT /api/student/topics/:id/milestones/:milestoneIndex
 * @access  Private/Student
 */
const submitMilestone = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { id, milestoneIndex } = req.params;
    const { notes, attachments } = req.body;

    const topic = await Topic.findOne({
      _id: id,
      'topic_group_student.student': studentId,
      'topic_group_student.status': { $in: ['approved', 'pending'] },
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Đề tài không tồn tại hoặc bạn không tham gia',
      });
    }

    if (!topic.milestones || !topic.milestones[milestoneIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Mốc thời gian không tồn tại',
      });
    }

    // Update milestone
    topic.milestones[milestoneIndex].status = 'completed'; // For now, allow student to mark as completed to see the % move
    topic.milestones[milestoneIndex].notes = notes;
    topic.milestones[milestoneIndex].completed_date = new Date();
    if (attachments) {
      topic.milestones[milestoneIndex].attachments = attachments;
    }

    await topic.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật tiến độ thành công',
      data: topic.milestones[milestoneIndex],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableTopics,
  getTopicById,
  registerForTopic,
  cancelRegistration,
  proposeTopic,
  updateProposedTopic,
  deleteProposedTopic,
  getMyTopic,
  getTopicProgress,
  getTopicsProgress,
  getMyTopics,
  getGrades,
  getRegistrationHistory,
  getStatistics,
  submitMilestone,
};
