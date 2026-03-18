const Notification = require('../../models/Notification');

/**
 * @desc    Get all notifications for the logged-in teacher
 * @route   GET /api/teacher/notifications
 * @access  Private/Teacher
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id?.toString();

    // Match by user_id string OR ObjectId string in recipient field
    const notifications = await Notification.find({
      user_notification_recipient: { $in: [userId, req.user.id?.toString()] },
    })
      .populate('user_notification_sender', 'user_name user_id')
      .populate('user_notification_topic', 'topic_title')
      .sort({ created_at: -1 })
      .limit(100);

    // Map to UI-friendly shape
    const data = notifications.map((n) => ({
      _id: n._id,
      notification_title: n.user_notification_title,
      notification_content: n.user_notification_content,
      notification_type:
        n.user_notification_type === 'system' ? 'info' : 'info',
      is_read: n.user_notification_isRead,
      sender: n.user_notification_sender?.user_name || 'Hệ thống',
      topic: n.user_notification_topic?.topic_title || null,
      createdAt: n.created_at,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/teacher/notifications/:id/read
 * @access  Private/Teacher
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id?.toString();

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user_notification_recipient: { $in: [userId, req.user.id?.toString()] },
      },
      { user_notification_isRead: true },
      { new: true }
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    res.status(200).json({ success: true, message: 'Đã đánh dấu là đã đọc' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark ALL notifications as read for this teacher
 * @route   PATCH /api/teacher/notifications/mark-all-read
 * @access  Private/Teacher
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id?.toString();

    await Notification.updateMany(
      {
        user_notification_recipient: { $in: [userId, req.user.id?.toString()] },
        user_notification_isRead: false,
      },
      { user_notification_isRead: true }
    );

    res
      .status(200)
      .json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/teacher/notifications/:id
 * @access  Private/Teacher
 */
const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id?.toString();

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_notification_recipient: { $in: [userId, req.user.id?.toString()] },
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    res.status(200).json({ success: true, message: 'Đã xóa thông báo' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread count
 * @route   GET /api/teacher/notifications/unread-count
 * @access  Private/Teacher
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id?.toString();

    const count = await Notification.countDocuments({
      user_notification_recipient: { $in: [userId, req.user.id?.toString()] },
      user_notification_isRead: false,
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
