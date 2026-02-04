const mongoose = require('mongoose');

const topicCategorySchema = new mongoose.Schema(
  {
    topic_category_title: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      unique: true,
      trim: true,
      maxlength: [200, 'Tên danh mục không quá 200 ký tự'],
    },
    topic_category_description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Mô tả không quá 1000 ký tự'],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

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
  }
);

topicCategorySchema.index({ topic_category_title: 1 }, { unique: true });
topicCategorySchema.index({ is_active: 1 });

module.exports = mongoose.model('TopicCategory', topicCategorySchema);
