const mongoose = require('mongoose');

const councilSchema = new mongoose.Schema(
  {
    council_name: {
      type: String,
      required: [true, 'Tên hội đồng là bắt buộc'],
      unique: true,
      trim: true,
    },
    council_description: String,
    council_members: [
      {
        member: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['chairman', 'secretary', 'member', 'reviewer'],
          default: 'member',
        },
      },
    ],
    assigned_topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    defense_date: Date,
    defense_location: String,
    council_status: {
      type: String,
      enum: ['planning', 'active', 'completed'],
      default: 'planning',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

councilSchema.index({ council_status: 1 });
councilSchema.index({ defense_date: 1 });

module.exports = mongoose.model('Council', councilSchema);
