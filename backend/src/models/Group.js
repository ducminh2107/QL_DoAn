const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    group_name: String,
    group_members: [
      {
        student_id: String,
        student_name: String,
        role: {
          type: String,
          enum: ['leader', 'member'],
          default: 'member',
        },
      },
    ],
    group_max_member: {
      type: Number,
      default: 5,
    },
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('Group', groupSchema, 'groupstud');
