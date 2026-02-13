const Faculty = require('../models/Faculty');

const getAllFaculties = async (req, res, next) => {
  try {
    const faculties = await Faculty.find();
    res
      .status(200)
      .json({ success: true, count: faculties.length, data: faculties });
  } catch (error) {
    next(error);
  }
};

const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res
        .status(404)
        .json({ success: false, message: 'Khoa không tồn tại' });
    }
    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    next(error);
  }
};

const createFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.create(req.body);
    res
      .status(201)
      .json({ success: true, message: 'Tạo khoa thành công', data: faculty });
  } catch (error) {
    next(error);
  }
};

const updateFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!faculty) {
      return res
        .status(404)
        .json({ success: false, message: 'Khoa không tồn tại' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Cập nhật thành công', data: faculty });
  } catch (error) {
    next(error);
  }
};

const deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res
        .status(404)
        .json({ success: false, message: 'Khoa không tồn tại' });
    }
    res.status(200).json({ success: true, message: 'Xóa khoa thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
