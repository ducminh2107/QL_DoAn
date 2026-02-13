const RegistrationPeriod = require('../models/RegistrationPeriod');

const getAllPeriods = async (req, res, next) => {
  try {
    const periods = await RegistrationPeriod.find()
      .populate('semester_id', 'school_year_start school_year_end semester')
      .populate('topics_allowed', 'topic_title');
    res
      .status(200)
      .json({ success: true, count: periods.length, data: periods });
  } catch (error) {
    next(error);
  }
};

const getPeriodById = async (req, res, next) => {
  try {
    const period = await RegistrationPeriod.findById(req.params.id)
      .populate('semester_id', 'school_year_start school_year_end semester')
      .populate('topics_allowed', 'topic_title');
    if (!period) {
      return res
        .status(404)
        .json({ success: false, message: 'Đợt đăng ký không tồn tại' });
    }
    res.status(200).json({ success: true, data: period });
  } catch (error) {
    next(error);
  }
};

const createPeriod = async (req, res, next) => {
  try {
    const period = await RegistrationPeriod.create(req.body);
    res
      .status(201)
      .json({
        success: true,
        message: 'Tạo đợt đăng ký thành công',
        data: period,
      });
  } catch (error) {
    next(error);
  }
};

const updatePeriod = async (req, res, next) => {
  try {
    const period = await RegistrationPeriod.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!period) {
      return res
        .status(404)
        .json({ success: false, message: 'Đợt đăng ký không tồn tại' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Cập nhật thành công', data: period });
  } catch (error) {
    next(error);
  }
};

const deletePeriod = async (req, res, next) => {
  try {
    const period = await RegistrationPeriod.findByIdAndDelete(req.params.id);
    if (!period) {
      return res
        .status(404)
        .json({ success: false, message: 'Đợt đăng ký không tồn tại' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Xóa đợt đăng ký thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPeriods,
  getPeriodById,
  createPeriod,
  updatePeriod,
  deletePeriod,
};
