const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    // Registration Info
    topic_registration_period: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RegistrationPeriod',
      required: [true, 'Đợt đăng ký là bắt buộc'],
    },

    // Basic Info
    topic_title: {
      type: String,
      required: [true, 'Tiêu đề đề tài là bắt buộc'],
      trim: true,
      maxlength: [500, 'Tiêu đề không quá 500 ký tự'],
    },
    topic_description: {
      type: String,
      required: [true, 'Mô tả đề tài là bắt buộc'],
      minlength: [50, 'Mô tả ít nhất 50 ký tự'],
    },
    topic_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TopicCategory',
      required: [true, 'Danh mục đề tài là bắt buộc'],
    },
    topic_major: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Major',
      required: [true, 'Chuyên ngành là bắt buộc'],
    },

    // Creator & Group Info
    topic_creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người tạo đề tài là bắt buộc'],
    },
    topic_max_members: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    topic_group_student: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        joined_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    
    
    // Instructor & Reviewer Assignment
    topic_instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    topic_reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Approval Status
    topic_teacher_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'need_revision'],
      default: 'pending',
    },
    topic_leader_status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },

    // Requests & Reports
    topic_advisor_request: String,
    topic_final_report: String,
    topic_defense_request: String,

    // Teacher features
    teacher_notes: {
      type: String,
      maxlength: 2000,
    },
    teacher_feedback: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ['progress', 'report', 'general'],
        },
        content: String,
        attachments: [String],
      },
    ],
    milestones: [
      {
        name: String,
        description: String,
        due_date: Date,
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed', 'delayed'],
          default: 'pending',
        },
        completed_date: Date,
        attachments: [String],
        notes: String,
      },
    ],
    defense_schedule: {
      scheduled_date: Date,
      scheduled_time: String,
      room: String,
      status: {
        type: String,
        enum: ['pending', 'scheduled', 'completed', 'cancelled'],
        default: 'pending',
      },
      notes: String,
    },

    // Rubrics
    rubric_instructor: {
      rubric_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rubric',
      },
      evaluations: [
        {
          criteria: String,
          score: Number,
          max_score: Number,
          comment: String,
          evaluated_at: Date,
        },
      ],
      total_score: Number,
      submitted_at: Date,
    },

    rubric_reviewer: {
      rubric_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rubric',
      },
      evaluations: [
        {
          criteria: String,
          score: Number,
          max_score: Number,
          comment: String,
          evaluated_at: Date,
        },
      ],
      total_score: Number,
      submitted_at: Date,
    },

    rubric_assembly: {
      rubric_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rubric',
      },
      evaluations: [
        {
          criteria: String,
          score: Number,
          max_score: Number,
          comment: String,
          evaluated_at: Date,
        },
      ],
      total_score: Number,
      submitted_at: Date,
    },

    // Defense Information
    topic_assembly: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assembly',
    },
    topic_room: String,
    topic_time_start: Date,
    topic_time_end: Date,
    topic_date: Date,
    topic_block: String,

    // Metadata
    is_active: {
      type: Boolean,
      default: true,
    },
    is_completed: {
      type: Boolean,
      default: false,
    },

    // Timestamps
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
topicSchema.index({ topic_creator: 1 });
topicSchema.index({ topic_instructor: 1 });
topicSchema.index({ topic_reviewer: 1 });
topicSchema.index({ topic_category: 1 });
topicSchema.index({ topic_major: 1 });
topicSchema.index({ 'topic_group_student.student': 1 });
topicSchema.index({ topic_teacher_status: 1, topic_leader_status: 1 });
topicSchema.index({ is_active: 1, is_completed: 1 });
topicSchema.index({ created_at: -1 });

// Virtuals
topicSchema.virtual('available_slots').get(function () {
  const approvedCount = this.topic_group_student.filter(
    (member) => member.status === 'approved'
  ).length;
  return this.topic_max_members - approvedCount;
});

topicSchema.virtual('has_available_slots').get(function () {
  return this.available_slots > 0;
});

topicSchema.virtual('is_full').get(function () {
  return this.available_slots <= 0;
});

// Pre-save hook
topicSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Static methods
topicSchema.statics.findByStatus = function (status) {
  return this.find({ topic_teacher_status: status });
};

topicSchema.statics.findByMajor = function (majorId) {
  return this.find({ topic_major: majorId });
};

topicSchema.statics.findAvailableTopics = function () {
  return this.find({
    is_active: true,
    topic_teacher_status: 'approved',
    topic_leader_status: 'approved',
  });
};

module.exports = mongoose.model('Topic', topicSchema);
