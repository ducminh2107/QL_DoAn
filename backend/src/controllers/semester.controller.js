const Semester = require('../models/Semester');

const getAllSemesters = async (req, res, next) => {
  try {
    const semesters = await Semester.find();

    // Sort logic:
    // 1. is_active (true first)
    // 2. Year (desc)
    // 3. Semester type: 2 -> 1 -> he (Order: 2, 1, he)
    const sortedSemesters = semesters.sort((a, b) => {
      // Priority 1: is_active
      if (a.is_active !== b.is_active) return b.is_active ? 1 : -1;

      // Priority 2: school_year_start
      if (b.school_year_start !== a.school_year_start) {
        return b.school_year_start - a.school_year_start;
      }

      // Priority 3: semester order (2 -> 1 -> he)
      const order = { 2: 1, 1: 2, he: 3 };
      const orderA = order[a.semester] || 99;
      const orderB = order[b.semester] || 99;
      return orderA - orderB;
    });

    res
      .status(200)
      .json({
        success: true,
        count: sortedSemesters.length,
        data: sortedSemesters,
      });
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
    if (req.body.is_active === true || req.body.is_active === 'true') {
      await Semester.updateMany({}, { is_active: false });
    }
    const semester = await Semester.create(req.body);
    res.status(201).json({
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
    if (req.body.is_active === true || req.body.is_active === 'true') {
      await Semester.updateMany(
        { _id: { $ne: req.params.id } },
        { is_active: false }
      );
    }
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
