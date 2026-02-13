const Schedule = require('../../models/Schedule');
const SystemLog = require('../../models/SystemLog');

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const schedules = await Schedule.find(filter)
      .sort({ start_date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('created_by', 'user_name email');

    const total = await Schedule.countDocuments(filter);

    res.json({
      success: true,
      data: schedules,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting schedules:', error);
    res
      .status(500)
      .json({ success: false, message: 'Lỗi lấy dữ liệu lịch trình' });
  }
};

// Get schedule by id
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id).populate(
      'created_by',
      'user_name email'
    );

    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy lịch trình' });
    }

    res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy lịch trình' });
  }
};

// Create schedule
exports.createSchedule = async (req, res) => {
  try {
    const { schedule_name, description, start_date, end_date, status } =
      req.body;

    if (!schedule_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Tên lịch, ngày bắt đầu và ngày kết thúc là bắt buộc',
      });
    }

    const schedule = new Schedule({
      schedule_name,
      description,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      status: status || 'scheduled',
      created_by: req.user._id,
    });

    await schedule.save();

    // Log action
    await SystemLog.create({
      action: 'CREATE_SCHEDULE',
      collection_name: 'schedules',
      document_id: schedule._id,
      user_id: req.user.user_id,
      changes: { schedule_name, start_date, end_date, status },
      ip_address: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Tạo lịch trình thành công',
      data: schedule,
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo lịch trình' });
  }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule_name, description, start_date, end_date, status } =
      req.body;

    const schedule = await Schedule.findByIdAndUpdate(
      id,
      {
        schedule_name,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status,
        updated_at: Date.now(),
      },
      { new: true }
    );

    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy lịch trình' });
    }

    // Log action
    await SystemLog.create({
      action: 'UPDATE_SCHEDULE',
      collection_name: 'schedules',
      document_id: schedule._id,
      user_id: req.user.user_id,
      changes: { schedule_name, start_date, end_date, status },
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: 'Cập nhật lịch trình thành công',
      data: schedule,
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res
      .status(500)
      .json({ success: false, message: 'Lỗi cập nhật lịch trình' });
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findByIdAndDelete(id);

    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy lịch trình' });
    }

    // Log action
    await SystemLog.create({
      action: 'DELETE_SCHEDULE',
      collection_name: 'schedules',
      document_id: schedule._id,
      user_id: req.user.user_id,
      changes: { schedule_name: schedule.schedule_name },
      ip_address: req.ip,
    });

    res.json({ success: true, message: 'Xóa lịch trình thành công' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa lịch trình' });
  }
};
