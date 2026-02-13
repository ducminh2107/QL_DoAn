const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    // General Settings
    system_name: {
      type: String,
      default: 'Hệ Thống Quản Lý Luận Văn',
    },
    system_version: {
      type: String,
      default: '1.0.0',
    },
    support_email: {
      type: String,
      default: 'support@thesis.local',
    },

    // Thesis Settings
    max_topics_per_student: {
      type: Number,
      default: 3,
    },
    max_students_per_topic: {
      type: Number,
      default: 5,
    },
    allow_topic_proposal: {
      type: Boolean,
      default: true,
    },

    // Security Settings
    password_min_length: {
      type: Number,
      default: 8,
    },
    session_timeout: {
      type: Number,
      default: 60, // minutes
    },
    enable_2fa: {
      type: Boolean,
      default: false,
    },

    // Notification Settings
    enable_email_notification: {
      type: Boolean,
      default: true,
    },
    notification_frequency: {
      type: Number,
      default: 24, // hours
    },

    // Additional settings
    maintenance_mode: {
      type: Boolean,
      default: false,
    },
    maintenance_message: {
      type: String,
      default: '',
    },

    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
  { timestamps: true }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
