const Major = require('../models/Major');

const getAllMajors = async (req, res, next) => {
  try {
    const majors = await Major.find().populate(
      'major_faculty',
      'faculty_title'
    );
    res.status(200).json({ success: true, count: majors.length, data: majors });
  } catch (error) {
    next(error);
  }
};

const getMajorById = async (req, res, next) => {
  try {
    const major = await Major.findById(req.params.id).populate(
      'major_faculty',
      'faculty_title'
    );
    if (!major) {
      return res
        .status(404)
        .json({ success: false, message: 'Chuyên ngành không tồn tại' });
    }
    res.status(200).json({ success: true, data: major });
  } catch (error) {
    next(error);
  }
};

const createMajor = async (req, res, next) => {
  try {
    const major = await Major.create(req.body);
    res
      .status(201)
      .json({
        success: true,
        message: 'Tạo chuyên ngành thành công',
        data: major,
      });
  } catch (error) {
    next(error);
  }
};

const updateMajor = async (req, res, next) => {
  try {
    const major = await Major.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!major) {
      return res
        .status(404)
        .json({ success: false, message: 'Chuyên ngành không tồn tại' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Cập nhật thành công', data: major });
  } catch (error) {
    next(error);
  }
};

const deleteMajor = async (req, res, next) => {
  try {
    const major = await Major.findByIdAndDelete(req.params.id);
    if (!major) {
      return res
        .status(404)
        .json({ success: false, message: 'Chuyên ngành không tồn tại' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Xóa chuyên ngành thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMajors,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
};
