const mongoose = require('mongoose');

const assemblySchema = new mongoose.Schema(
  {
    assembly_name: {
      type: String,
      required: true,
      trim: true,
    },
    assembly_description: {
      type: String,
      trim: true,
    },
    assembly_major: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Major',
    },
    chairman: {
      type: String,
    },
    secretary: {
      type: String,
    },
    members: [
      {
        member_id: String,
        member_name: String,
        role: {
          type: String,
          enum: ['member', 'expert'],
          default: 'member',
        },
      },
    ],
    defense_date: Date,
    defense_location: String,
    assembly_status: {
      type: String,
      enum: ['planning', 'active', 'completed'],
      default: 'planning',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('Assembly', assemblySchema, 'assemblies');
