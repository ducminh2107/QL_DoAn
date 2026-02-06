const mongoose = require('mongoose');

const rubricEvaluationSchema = new mongoose.Schema(
  {
    criteria: { type: String, required: true },
    description: String,
    weight: { type: Number, default: 0 },
    max_score: { type: Number, default: 10 },
  },
  { _id: true }
);

const rubricSchema = new mongoose.Schema(
  {
    rubric_title: { type: String, required: true },
    rubric_category: {
      type: String,
      enum: ['instructor', 'reviewer'],
      required: true,
    },
    rubric_topic_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TopicCategory',
    },
    rubric_template: { type: Boolean, default: false },
    rubric_evaluations: [rubricEvaluationSchema],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

rubricSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Rubric', rubricSchema);
