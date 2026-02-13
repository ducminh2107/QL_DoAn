const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    collection_name: {
      type: String,
      required: true,
    },
    document_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    user_id: {
      type: String,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ip_address: {
      type: String,
    },
  },
  { timestamps: false }
);

systemLogSchema.index({ collection_name: 1, timestamp: -1 });
systemLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
