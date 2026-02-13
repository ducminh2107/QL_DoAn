const mongoose = require('mongoose');

const rubricEvaluationSchema = new mongoose.Schema(
  {
    serial: Number,
    evaluation_criteria: String,
    grading_scale: String,
    weight: Number,
    level_core: [
      {
        level: String,
        min_score: Number,
        max_score: Number,
        description: String,
      },
    ],
    note: String,
  },
  { _id: true }
);

const rubricSchema = new mongoose.Schema(
  {
    rubric_name: { type: String, required: true },
    rubric_category: {
      type: String,
      enum: ['instructor', 'reviewer', 'assembly'],
      required: true,
    },
    rubric_topic_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TopicCategory',
    },
    rubric_evaluations: [rubricEvaluationSchema],
    rubric_note: String,
    rubric_template: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('Rubric', rubricSchema);
