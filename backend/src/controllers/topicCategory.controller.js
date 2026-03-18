const TopicCategory = require('../models/TopicCategory');

/**
 * @desc    Get all topic categories
 * @route   GET /api/topic-categories
 * @access  Public/Private
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await TopicCategory.find()
      .sort({ topic_category_title: 1 })
      .select('_id topic_category_title topic_category_description');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new topic category
 * @route   POST /api/topic-categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    // Map from frontend format if necessary
    const {
      category_name,
      description,
      topic_category_title,
      topic_category_description,
    } = req.body;

    const title = topic_category_title || category_name;
    const desc = topic_category_description || description;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: 'Tên danh mục là bắt buộc' });
    }

    const newCategory = await TopicCategory.create({
      topic_category_title: title,
      topic_category_description: desc,
    });

    res.status(201).json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: 'Tên danh mục đã tồn tại' });
    }
    next(error);
  }
};

/**
 * @desc    Update topic category
 * @route   PUT /api/topic-categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const {
      category_name,
      description,
      topic_category_title,
      topic_category_description,
    } = req.body;

    const title = topic_category_title || category_name;
    const desc = topic_category_description || description;

    const category = await TopicCategory.findByIdAndUpdate(
      req.params.id,
      {
        topic_category_title: title,
        topic_category_description: desc,
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: 'Tên danh mục đã tồn tại' });
    }
    next(error);
  }
};

/**
 * @desc    Delete topic category
 * @route   DELETE /api/topic-categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await TopicCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
