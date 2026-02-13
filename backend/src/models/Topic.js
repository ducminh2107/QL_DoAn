const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    topic_registration_period: {
      type: String,
    },
    topic_registration_period_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RegistrationPeriod',
    },

    topic_title: {
      type: String,
      required: [true, 'Tieu de de tai la bat buoc'],
      trim: true,
      maxlength: [500, 'Tieu de khong qua 500 ky tu'],
    },
    topic_description: {
      type: String,
      required: [true, 'Mo ta de tai la bat buoc'],
      minlength: [10, 'Mo ta it nhat 10 ky tu'],
    },
    topic_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TopicCategory',
      required: [true, 'Danh muc de tai la bat buoc'],
    },
    topic_major: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Major',
      required: [true, 'Chuyen nganh la bat buoc'],
    },

    topic_creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Nguoi tao de tai la bat buoc'],
    },
    topic_creator_id: {
      type: String,
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
        student_id: String,
        student_name: String,
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

    topic_instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    topic_instructor_id: {
      type: String,
    },
    topic_reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    topic_reviewer_id: {
      type: String,
    },

    topic_teacher_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    topic_leader_status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },

    topic_advisor_request: String,
    topic_final_report: String,
    topic_defense_request: String,

    is_system_topic: {
      type: Boolean,
      default: false,
    },

    rubric_instructor: {
      rubric_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rubric',
      },
      evaluations: [
        {
          criteria: String,
          score: Number,
          comment: String,
        },
      ],
      total_score: Number,
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
          comment: String,
        },
      ],
      total_score: Number,
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
          comment: String,
        },
      ],
      total_score: Number,
    },

    topic_assembly: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assembly',
    },
    topic_room: String,
    topic_time_start: Date,
    topic_time_end: Date,
    topic_date: Date,
    topic_block: String,

    // Legacy/support fields
    teacher_notes: String,
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

    is_active: {
      type: Boolean,
      default: true,
    },
    is_completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

topicSchema.index({ topic_creator: 1 });
topicSchema.index({ topic_instructor: 1 });
topicSchema.index({ topic_reviewer: 1 });
topicSchema.index({ topic_category: 1 });
topicSchema.index({ topic_major: 1 });
topicSchema.index({ 'topic_group_student.student': 1 });
topicSchema.index({ 'topic_group_student.student_id': 1 });
topicSchema.index({ topic_teacher_status: 1, topic_leader_status: 1 });
topicSchema.index({ is_active: 1, is_completed: 1 });
topicSchema.index({ created_at: -1 });

topicSchema.virtual('available_slots').get(function () {
  if (!this.topic_group_student) return this.topic_max_members || 0;
  const approvedCount = this.topic_group_student.filter(
    (member) => member.status === 'approved'
  ).length;
  return (this.topic_max_members || 0) - approvedCount;
});

topicSchema.virtual('has_available_slots').get(function () {
  return this.available_slots > 0;
});

topicSchema.virtual('is_full').get(function () {
  return this.available_slots <= 0;
});

topicSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

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
