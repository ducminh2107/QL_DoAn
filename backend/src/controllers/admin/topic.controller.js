const Topic = require('../../models/Topic');
const Notification = require('../../models/Notification');

/**
 * @desc    Get all topics waiting for Admin/Leader approval
 * @route   GET /api/admin/topics/pending
 * @access  Private/Admin
 */
const getPendingTopics = async (req, res, next) => {
  try {
    const topics = await Topic.find({
      topic_leader_status: 'pending',
      topic_teacher_status: 'approved', // must be approved by teacher first
      is_active: true,
    })
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title')
      .populate('topic_creator', 'user_name user_id email')
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
 * @desc    Get all approved topics ready for defense
 * @route   GET /api/admin/topics/approved
 * @access  Private/Admin
 */
const getAllApprovedTopics = async (req, res, next) => {
  try {
    const topics = await Topic.find({
      topic_leader_status: 'approved',
      topic_teacher_status: 'approved',
      is_active: true,
    })
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title')
      .populate('topic_creator', 'user_name user_id email')
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
 * @desc    Approve a topic
 * @route   PUT /api/admin/topics/:id/approve
 * @access  Private/Admin
 */
const approveTopic = async (req, res, next) => {
  try {
    const topicId = req.params.id;
    const { feedback } = req.body;

    const topic = await Topic.findById(topicId).populate(
      'topic_group_student.student',
      '_id'
    );

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề tài',
      });
    }

    topic.topic_leader_status = 'approved';
    if (feedback) {
      topic.teacher_notes = feedback;
    }
    await topic.save();

    // Collect all recipients to notify:
    // 1. Topic creator (teacher or student who proposed)
    // 2. All students in the group (pending/approved members)
    // 3. Topic instructor (if different from creator)
    const recipientSet = new Set();

    if (topic.topic_creator) {
      recipientSet.add(topic.topic_creator.toString());
    }
    if (topic.topic_instructor) {
      recipientSet.add(topic.topic_instructor.toString());
    }
    topic.topic_group_student?.forEach((member) => {
      if (member.student?._id) {
        recipientSet.add(member.student._id.toString());
      }
    });

    const notifContent =
      feedback || 'Đề tài đã được Quản trị viên/Khoa phê duyệt thành công! Chúc mừng bạn.';

    await Promise.all(
      [...recipientSet].map((recipientId) =>
        Notification.create({
          user_notification_title: `✅ Đề tài "${topic.topic_title}" đã được duyệt`,
          user_notification_sender: req.user.id,
          user_notification_recipient: recipientId,
          user_notification_content: notifContent,
          user_notification_type: 'system',
        })
      )
    );

    res.status(200).json({
      success: true,
      message: 'Đã duyệt đề tài thành công',
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a topic
 * @route   PUT /api/admin/topics/:id/reject
 * @access  Private/Admin
 */
const rejectTopic = async (req, res, next) => {
  try {
    const topicId = req.params.id;
    const { feedback } = req.body;

    const topic = await Topic.findById(topicId).populate(
      'topic_group_student.student',
      '_id'
    );

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề tài',
      });
    }

    topic.topic_leader_status = 'rejected';
    if (feedback) {
      topic.leader_feedback = feedback;
    }
    await topic.save();

    // Collect all recipients to notify (same logic as approve)
    const recipientSet = new Set();

    if (topic.topic_creator) {
      recipientSet.add(topic.topic_creator.toString());
    }
    if (topic.topic_instructor) {
      recipientSet.add(topic.topic_instructor.toString());
    }
    topic.topic_group_student?.forEach((member) => {
      if (member.student?._id) {
        recipientSet.add(member.student._id.toString());
      }
    });

    const notifContent =
      feedback || 'Đề tài không được Quản trị viên/Khoa chấp thuận. Vui lòng xem phản hồi và chỉnh sửa.';

    await Promise.all(
      [...recipientSet].map((recipientId) =>
        Notification.create({
          user_notification_title: `❌ Đề tài "${topic.topic_title}" bị từ chối`,
          user_notification_sender: req.user.id,
          user_notification_recipient: recipientId,
          user_notification_content: notifContent,
          user_notification_type: 'system',
        })
      )
    );

    res.status(200).json({
      success: true,
      message: 'Đã từ chối đề tài',
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingTopics,
  getAllApprovedTopics,
  approveTopic,
  rejectTopic,
};
