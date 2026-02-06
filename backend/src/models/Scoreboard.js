const mongoose = require('mongoose');

const scoreboardSchema = new mongoose.Schema(
  {
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    grader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rubric_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rubric' },
    rubric_student_evaluations: { type: Array },
    total_score: { type: Number },
    student_grades: { type: String },
    rubric_category: { type: String, enum: ['instructor', 'reviewer'] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

scoreboardSchema.index({ grader: 1 });
scoreboardSchema.index({ student_id: 1 });
scoreboardSchema.index({ topic_id: 1 });

scoreboardSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Scoreboard', scoreboardSchema);
