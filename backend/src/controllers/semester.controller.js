const Semester = require('../models/Semester');

const getAllSemesters = async (req, res, next) => {
  try {
    const semesters = await Semester.find().sort({
      school_year_start: -1,
      school_year_end: -1,
      semester: 1,
    });
    res
      .status(200)
      .json({ success: true, count: semesters.length, data: semesters });
  } catch (error) {
    next(error);
  }
};

const getSemesterById = async (req, res, next) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res
        .status(404)
        .json({ success: false, message: 'Học kỳ không tồn tại' });
    }
    res.status(200).json({ success: true, data: semester });
  } catch (error) {
    next(error);
  }
};

const createSemester = async (req, res, next) => {
  try {
    const semester = await Semester.create(req.body);
    res
      .status(201)
      .json({
        success: true,
        message: 'Tạo học kỳ thành công',
        data: semester,
      });
  } catch (error) {
    next(error);
  }
};

const updateSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!semester) {
      return res
        .status(404)
        .json({ success: false, message: 'Học kỳ không tồn tại' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Cập nhật thành công', data: semester });
  } catch (error) {
    next(error);
  }
};

const deleteSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findByIdAndDelete(req.params.id);
    if (!semester) {
      return res
        .status(404)
        .json({ success: false, message: 'Học kỳ không tồn tại' });
    }
    res.status(200).json({ success: true, message: 'Xóa học kỳ thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSemesters,
  getSemesterById,
  createSemester,
  updateSemester,
  deleteSemester,
};
