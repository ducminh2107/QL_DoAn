const Rubric = require('../models/Rubric');

const getAllRubrics = async (req, res, next) => {
  try {
    const rubrics = await Rubric.find().populate(
      'rubric_topic_category',
      'topic_category_title'
    );
    res
      .status(200)
      .json({ success: true, count: rubrics.length, data: rubrics });
  } catch (error) {
    next(error);
  }
};

const getRubricById = async (req, res, next) => {
  try {
    const rubric = await Rubric.findById(req.params.id).populate(
      'rubric_topic_category',
      'topic_category_title'
    );
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
    const rubric = await Rubric.create({
      ...req.body,
    });
    res
      .status(201)
      .json({ success: true, message: 'Tạo rubric thành công', data: rubric });
  } catch (error) {
    next(error);
  }
};

const updateRubric = async (req, res, next) => {
  try {
    const rubric = await Rubric.findByIdAndUpdate(req.params.id, req.body, {
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
