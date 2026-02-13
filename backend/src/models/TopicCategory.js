const mongoose = require('mongoose');

const topicCategorySchema = new mongoose.Schema(
  {
    topic_category_title: {
      type: String,
      required: [true, 'Ten danh muc la bat buoc'],
      unique: true,
      trim: true,
      maxlength: [200, 'Ten danh muc khong qua 200 ky tu'],
    },
    topic_category_description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Mo ta khong qua 1000 ky tu'],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

topicCategorySchema.index({ topic_category_title: 1 }, { unique: true });

module.exports = mongoose.model('TopicCategory', topicCategorySchema);
