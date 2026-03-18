const Rubric = require('../models/Rubric');

const getAllRubrics = async (req, res, next) => {
  try {
    const rubrics = await Rubric.find()
      .populate('rubric_topic_category', 'topic_category_title')
      .populate('semester', 'school_year_start school_year_end semester');
    res
      .status(200)
      .json({ success: true, count: rubrics.length, data: rubrics });
  } catch (error) {
    next(error);
  }
};

const getRubricById = async (req, res, next) => {
  try {
    const rubric = await Rubric.findById(req.params.id)
      .populate('rubric_topic_category', 'topic_category_title')
      .populate('semester', 'school_year_start school_year_end semester');
    if (!rubric) {
      return res
        .status(404)
        .json({ success: false, message: 'Rubric không tồn tại' });
    }
    res.status(200).json({ success: true, data: rubric });
  } catch (error) {
    next(error);
  }
};

const createRubric = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.rubric_topic_category) {
      delete data.rubric_topic_category;
    }
    const rubric = await Rubric.create(data);
    res
      .status(201)
      .json({ success: true, message: 'Tạo rubric thành công', data: rubric });
  } catch (error) {
    next(error);
  }
};

const updateRubric = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.rubric_topic_category) {
      data.rubric_topic_category = null;
    }
    const rubric = await Rubric.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!rubric) {
      return res
        .status(404)
        .json({ success: false, message: 'Rubric không tồn tại' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Cập nhật thành công', data: rubric });
  } catch (error) {
    next(error);
  }
};

const deleteRubric = async (req, res, next) => {
  try {
    const rubric = await Rubric.findByIdAndDelete(req.params.id);
    if (!rubric) {
      return res
        .status(404)
        .json({ success: false, message: 'Rubric không tồn tại' });
    }
    res.status(200).json({ success: true, message: 'Xóa rubric thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRubrics,
  getRubricById,
  createRubric,
  updateRubric,
  deleteRubric,
};
