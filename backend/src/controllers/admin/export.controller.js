const User = require('../../models/User');
const Topic = require('../../models/Topic');
const RegistrationPeriod = require('../../models/RegistrationPeriod');
const Scoreboard = require('../../models/Scoreboard');
const SystemLog = require('../../models/SystemLog');

// Helper function to convert JSON to CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const rows = data.map((obj) =>
    headers
      .map((header) => {
        const value = obj[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        const stringValue = String(value).replace(/"/g, '""');
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      })
      .join(',')
  );

  return [csvHeaders, ...rows].join('\n');
};

// Export data to CSV/Excel/JSON
exports.exportData = async (req, res) => {
  try {
    const { format = 'csv', data: dataTypes = [], dateRange = {} } = req.body;

    const exportData = {};

    // Fetch users if requested
    if (dataTypes.includes('users')) {
      const users = await User.find().select(
        'user_id user_name email user_phone user_status role created_at updated_at'
      );
      exportData.users = users;
    }

    // Fetch topics if requested
    if (dataTypes.includes('topics')) {
      const filter = {};
      if (dateRange.startDate || dateRange.endDate) {
        filter.created_at = {};
        if (dateRange.startDate)
          filter.created_at.$gte = new Date(dateRange.startDate);
        if (dateRange.endDate)
          filter.created_at.$lte = new Date(dateRange.endDate);
      }

      const topics = await Topic.find(filter)
        .select(
          'topic_title topic_description topic_category topic_major topic_creator topic_instructor topic_teacher_status topic_max_members created_at'
        )
        .populate('topic_creator', 'user_name user_id');
      exportData.topics = topics;
    }

    // Fetch registrations if requested
    if (dataTypes.includes('registrations')) {
      const filter = {};
      if (dateRange.startDate || dateRange.endDate) {
        filter.created_at = {};
        if (dateRange.startDate)
          filter.created_at.$gte = new Date(dateRange.startDate);
        if (dateRange.endDate)
          filter.created_at.$lte = new Date(dateRange.endDate);
      }

      const registrations = await RegistrationPeriod.find(filter)
        .select(
          'registration_period_semester registration_period_start registration_period_end registration_period_status semester_id block_topic topics_allowed created_at'
        )
        .populate('semester_id', 'school_year_start school_year_end semester')
        .populate('topics_allowed', 'topic_title');
      exportData.registrations = registrations;
    }

    // Fetch grades if requested
    if (dataTypes.includes('grades')) {
      const grades = await Scoreboard.find()
        .select(
          'student_id topic_id total_score rubric_student_evaluations grader rubric_category student_grades created_at'
        )
        .populate('topic_id', 'topic_title');
      exportData.grades = grades;
    }

    // Convert to requested format
    let fileContent;
    let filename;
    let mimeType;

    if (format === 'json') {
      fileContent = JSON.stringify(exportData, null, 2);
      filename = `export_${new Date().getTime()}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      // Combine all data into one CSV
      const csvRows = [];
      Object.keys(exportData).forEach((key) => {
        if (exportData[key].length > 0) {
          csvRows.push(`\n--- ${key} ---\n`);
          csvRows.push(convertToCSV(exportData[key]));
        }
      });
      fileContent = csvRows.join('\n');
      filename = `export_${new Date().getTime()}.csv`;
      mimeType = 'text/csv';
    } else if (format === 'xlsx') {
      // For Excel, return JSON and let frontend handle it or use a library
      fileContent = JSON.stringify(exportData);
      filename = `export_${new Date().getTime()}.xlsx`;
      mimeType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    // Log action
    await SystemLog.create({
      action: 'EXPORT_DATA',
      collection_name: 'exports',
      user_id: req.user.id,
      changes: { format, dataTypes },
      ip_address: req.ip,
    });

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileContent);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ success: false, message: 'Lỗi xuất dữ liệu' });
  }
};

// Export topics as CSV directly
exports.exportTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ is_active: true })
      .populate('topic_creator', 'user_name user_id')
      .populate('topic_instructor', 'user_name user_id')
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title')
      .sort({ createdAt: -1 });

    const rows = topics.map((t) => ({
      'Tên Đề Tài': t.topic_title || '',
      'Mô Tả': (t.topic_description || '').substring(0, 100),
      'Danh Mục': t.topic_category?.topic_category_title || '',
      'Chuyên Ngành': t.topic_major?.major_title || '',
      'Người Tạo': t.topic_creator?.user_name || '',
      'Mã GV Tạo': t.topic_creator?.user_id || '',
      'GV Hướng Dẫn':
        t.topic_instructor?.user_name || t.topic_creator?.user_name || '',
      'Trạng Thái': t.topic_teacher_status || '',
      'Đề Tài Hệ Thống': t.is_system_topic ? 'Có' : 'Không',
      'Số SV Tối Đa': t.topic_max_members || 1,
      'Số SV Hiện Tại': (t.topic_group_student || []).filter(
        (m) => m.status === 'approved'
      ).length,
      'Hoàn Thành': t.is_completed ? 'Có' : 'Không',
      'Ngày Tạo': t.createdAt
        ? new Date(t.createdAt).toLocaleDateString('vi-VN')
        : '',
    }));

    const csvData = '\ufeff' + convertToCSV(rows);
    const filename = `danh_sach_de_tai_${Date.now()}.csv`;

    await SystemLog.create({
      action: 'EXPORT_DATA',
      collection_name: 'topics',
      user_id: req.user.id,
      changes: { format: 'csv', count: rows.length },
      ip_address: req.ip,
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting topics:', error);
    res.status(500).json({ success: false, message: 'Lỗi xuất đề tài' });
  }
};

// Export grades as CSV
exports.exportGrades = async (req, res) => {
  try {
    const grades = await Scoreboard.find({ total_score: { $ne: null } })
      .populate('topic_id', 'topic_title')
      .sort({ createdAt: -1 });

    const rows = grades.map((g) => ({
      'Mã Sinh Viên': g.student_id || '',
      'Đề Tài': g.topic_id?.topic_title || '',
      'Loại Chấm': g.rubric_category || '',
      Điểm: g.total_score ?? '',
      'Xếp Loại': g.student_grades || '',
      'Nhận Xét': g.comments || '',
      'Ngày Chấm': g.created_at
        ? new Date(g.created_at).toLocaleDateString('vi-VN')
        : '',
    }));

    const csvData = '\ufeff' + convertToCSV(rows);
    const filename = `ket_qua_cham_diem_${Date.now()}.csv`;

    await SystemLog.create({
      action: 'EXPORT_DATA',
      collection_name: 'grades',
      user_id: req.user.id,
      changes: { format: 'csv', count: rows.length },
      ip_address: req.ip,
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting grades:', error);
    res.status(500).json({ success: false, message: 'Lỗi xuất điểm' });
  }
};

// Export users as CSV
exports.exportUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter)
      .populate('user_faculty', 'faculty_title')
      .populate('user_major', 'major_title')
      .sort({ createdAt: -1 });

    const rows = users.map((u) => ({
      'Mã Người Dùng': u.user_id || '',
      'Họ Tên': u.user_name || '',
      Email: u.email || '',
      'Điện Thoại': u.user_phone || '',
      'Giới Tính': u.user_gender || '',
      'Lớp': u.user_class || '',
      'Khoa': u.user_faculty?.faculty_title || '',
      'Ngành': u.user_major?.major_title || '',
      'Khóa Học': u.user_academic_year || '',
      'Hệ Đào Tạo': u.user_training_system || '',
      'CCCD': u.user_CCCD || '',
      'Chức Danh': u.user_title || '',
      'Bộ Môn': u.user_department || '',
      'Địa Chỉ': u.user_permanent_address || '',
      'Vai Trò': u.role || '',
      'Trạng Thái': u.user_status ? 'Hoạt động' : 'Vô hiệu',
      'Ngày Tạo': u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('vi-VN')
        : '',
    }));

    const csvData = '\ufeff' + convertToCSV(rows);
    const roleName = role || 'tat_ca';
    const filename = `danh_sach_nguoi_dung_${roleName}_${Date.now()}.csv`;

    await SystemLog.create({
      action: 'EXPORT_DATA',
      collection_name: 'users',
      user_id: req.user.id,
      changes: { format: 'csv', role, count: rows.length },
      ip_address: req.ip,
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ success: false, message: 'Lỗi xuất người dùng' });
  }
};
