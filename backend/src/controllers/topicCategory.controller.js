const TopicCategory = require('../models/TopicCategory');

/**
 * @desc    Get all topic categories
 * @route   GET /api/topic-categories
 * @access  Private
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await TopicCategory.find()
      .sort({ topic_category_title: 1 })
      .select('topic_category_title topic_category_description');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
};
