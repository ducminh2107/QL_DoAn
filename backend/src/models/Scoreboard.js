const mongoose = require('mongoose');

const scoreboardSchema = new mongoose.Schema(
  {
    rubric_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rubric',
    },
    rubric_category: {
      type: String,
      enum: ['instructor', 'reviewer', 'assembly'],
    },
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    grader: {
      type: String,
    },
    student_id: {
      type: String,
    },
    rubric_student_evaluations: [
      {
        criteria_id: Number,
        criteria_name: String,
        score: Number,
        comment: String,
        max_score: Number,
        weight: Number,
      },
    ],
    total_score: Number,
    student_grades: String,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

scoreboardSchema.index({ grader: 1 });
scoreboardSchema.index({ student_id: 1 });
scoreboardSchema.index({ topic_id: 1 });

module.exports = mongoose.model('Scoreboard', scoreboardSchema);
