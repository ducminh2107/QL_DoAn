const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user_notification_title: {
      type: String,
      required: true,
      trim: true,
    },
    user_notification_sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    user_notification_recipient: {
      type: String,
      required: true,
    },
    user_notification_content: {
      type: String,
      required: true,
    },
    user_notification_type: {
      type: String,
      enum: ['system', 'personal'],
      default: 'system',
    },
    user_notification_isRead: {
      type: Boolean,
      default: false,
    },
    user_notification_topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model(
  'Notification',
  notificationSchema,
  'usernotifications'
);
