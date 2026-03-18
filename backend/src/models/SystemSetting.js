const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    // ─── Thông tin trường ──────────────────────────────────────────────
    system_name: {
      type: String,
      default: 'Hệ Thống Quản Lý Luận Văn',
    },
    system_version: {
      type: String,
      default: '1.0.0',
    },
    school_name: {
      type: String,
      default: 'Trường Đại Học',
    },
    school_logo_url: {
      type: String,
      default: '',
    },
    school_website: {
      type: String,
      default: '',
    },
    contact_email: {
      type: String,
      default: '',
    },
    contact_phone: {
      type: String,
      default: '',
    },
    contact_address: {
      type: String,
      default: '',
    },
    support_email: {
      type: String,
      default: 'support@thesis.local',
    },

    // ─── Cài đặt đề tài ──────────────────────────────────────────────
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

    // ─── Bảo mật ─────────────────────────────────────────────────────
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

    // ─── Thông báo Email ─────────────────────────────────────────────
    enable_email_notification: {
      type: Boolean,
      default: true,
    },
    notification_frequency: {
      type: Number,
      default: 24, // hours
    },
    email_smtp_host: {
      type: String,
      default: '',
    },
    email_smtp_port: {
      type: Number,
      default: 587,
    },
    email_smtp_user: {
      type: String,
      default: '',
    },
    email_smtp_password: {
      type: String,
      default: '',
    },
    email_smtp_secure: {
      type: Boolean,
      default: false,
    },
    email_from_name: {
      type: String,
      default: 'Hệ thống Quản lý Luận văn',
    },
    email_from_address: {
      type: String,
      default: '',
    },
    // Sự kiện kích hoạt gửi email
    notify_on_registration: {
      type: Boolean,
      default: true,
    },
    notify_on_approval: {
      type: Boolean,
      default: true,
    },
    notify_on_grading: {
      type: Boolean,
      default: true,
    },

    // ─── Bảo trì ─────────────────────────────────────────────────────
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
