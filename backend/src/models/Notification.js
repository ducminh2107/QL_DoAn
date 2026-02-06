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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user_notification_content: {
      type: String,
    },
    user_notification_type: {
      type: String,
      enum: ['system', 'message', 'reminder', 'info'],
      default: 'system',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
