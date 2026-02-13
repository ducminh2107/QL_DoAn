const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Topic = require('../../models/Topic');
const Semester = require('../../models/Semester');
const Faculty = require('../../models/Faculty');
const SystemLog = require('../../models/SystemLog');

// Simple CSV parser
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

// Import data from CSV/Excel
exports.importData = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Vui lòng chọn tệp' });
    }

    const { format, type } = req.body;
    const filePath = req.file.path;

    let importedCount = 0;
    let errors = [];

    // Handle CSV parsing
    if (format === 'csv') {
      importedCount = await parseCSVFile(filePath, type, errors);
    } else if (format === 'xlsx') {
      // Handle Excel parsing
      importedCount = await parseExcelFile(filePath, type, errors);
    }

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Log action
    await SystemLog.create({
      action: 'IMPORT_DATA',
      collection_name: type,
      user_id: req.user.user_id,
      changes: { format, count: importedCount },
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: `Nhập ${importedCount} bản ghi ${type} thành công`,
      data: {
        imported: importedCount,
        type,
        format,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ success: false, message: 'Lỗi nhập dữ liệu' });
  }
};

// Parse CSV file
const parseCSVFile = async (filePath, type, errors) => {
  return new Promise((resolve) => {
    let count = 0;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());

    if (lines.length === 0) {
      resolve(0);
      return;
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);

    // Parse data rows
    (async () => {
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i]);
          const row = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx];
          });

          switch (type) {
            case 'users':
              await importUser(row);
              break;
            case 'topics':
              await importTopic(row);
              break;
            case 'semesters':
              await importSemester(row);
              break;
            case 'faculties':
              await importFaculty(row);
              break;
          }
          count++;
        } catch (error) {
          errors.push({ row: i + 1, error: error.message });
        }
      }
      resolve(count);
    })();
  });
};

// Parse Excel file (placeholder - requires xlsx library)
const parseExcelFile = async (filePath, type, errors) => {
  // Implement based on xlsx library
  return 0;
};

// Import user
const importUser = async (row) => {
  const { user_id, user_name, email, user_phone, phone, role } = row;

  if (!user_id || !user_name || !email) {
    throw new Error('Missing required fields');
  }

  const existingUser = await User.findOne({
    $or: [{ user_id }, { email }],
  });

  if (!existingUser) {
    const newUser = new User({
      user_id,
      user_name,
      email,
      user_phone: user_phone || phone,
      role: role || 'student',
      user_status: true,
      password: 'default123', // Should be changed on first login
    });
    await newUser.save();
  }
};

// Import topic
const importTopic = async (row) => {
  const topic_title = row.topic_title;
  const topic_description = row.topic_description || row.description || '';
  const topic_category = row.topic_category || row.category;
  const topic_major = row.topic_major || row.major;
  const topic_max_members = row.topic_max_members || row.max_students;
  const topic_creator = row.topic_creator;
  const topic_creator_id = row.topic_creator_id;
  const topic_creator_user_id = row.topic_creator_user_id;
  const topic_registration_period = row.topic_registration_period;
  const topic_teacher_status = row.topic_teacher_status;

  if (!topic_title || !topic_category || !topic_major) {
    throw new Error('Missing required topic fields');
  }

  let creatorKey = topic_creator || topic_creator_id || topic_creator_user_id;
  let creatorObjectId = null;
  let creatorUserId = null;

  if (creatorKey) {
    if (mongoose.Types.ObjectId.isValid(creatorKey)) {
      creatorObjectId = creatorKey;
      const user = await User.findById(creatorKey).select('user_id');
      creatorUserId = user?.user_id || null;
    } else {
      const user = await User.findOne({ user_id: creatorKey }).select(
        '_id user_id'
      );
      creatorObjectId = user?._id || null;
      creatorUserId = user?.user_id || null;
    }
  }

  if (!creatorObjectId) {
    throw new Error('Missing topic creator');
  }

  const existingTopic = await Topic.findOne({ topic_title });

  if (!existingTopic) {
    const newTopic = new Topic({
      topic_title,
      topic_description,
      topic_category,
      topic_major,
      topic_creator: creatorObjectId,
      topic_creator_id: creatorUserId || undefined,
      topic_max_members: parseInt(topic_max_members || 1, 10),
      topic_registration_period,
      topic_teacher_status: topic_teacher_status || 'approved',
      topic_leader_status: 'pending',
      is_active: true,
    });
    await newTopic.save();
  }
};

// Import semester
const importSemester = async (row) => {
  const school_year_start = parseInt(
    row.school_year_start || row.year_start || row.year,
    10
  );
  const school_year_end = parseInt(
    row.school_year_end ||
      row.year_end ||
      (row.year ? parseInt(row.year, 10) + 1 : ''),
    10
  );
  const semester =
    row.semester ||
    (row.semester_code
      ? row.semester_code.replace(/HK/i, '').trim()
      : undefined);

  if (!school_year_start || !school_year_end || !semester) {
    throw new Error('Missing required fields');
  }

  const existingSemester = await Semester.findOne({
    school_year_start,
    school_year_end,
    semester,
  });

  if (!existingSemester) {
    const newSemester = new Semester({
      school_year_start,
      school_year_end,
      semester,
    });
    await newSemester.save();
  }
};

// Import faculty
const importFaculty = async (row) => {
  const faculty_title = row.faculty_title || row.faculty_name;
  const faculty_description = row.faculty_description || row.description;

  if (!faculty_title) {
    throw new Error('Missing faculty title');
  }

  const existingFaculty = await Faculty.findOne({ faculty_title });

  if (!existingFaculty) {
    const newFaculty = new Faculty({
      faculty_title,
      faculty_description,
    });
    await newFaculty.save();
  }
};

// Get import templates
exports.getTemplate = async (req, res) => {
  try {
    const { type } = req.params;

    let csvContent;
    let filename;

    switch (type) {
      case 'users':
        csvContent =
          'user_id,user_name,email,phone,role\nSV001,Nguyễn Văn A,sv001@example.com,0123456789,student';
        filename = 'template_users.csv';
        break;
      case 'topics':
        csvContent =
          'topic_title,topic_description,topic_category,topic_major,topic_max_members\nDe tai mau,Mo ta de tai,ID_DANH_MUC,ID_CHUYEN_NGANH,1';
        filename = 'template_topics.csv';
        break;
      case 'semesters':
        csvContent =
          'semester_code,year,start_date,end_date\nHK1,2024,2024-09-01,2024-12-31';
        filename = 'template_semesters.csv';
        break;
      case 'faculties':
        csvContent =
          'faculty_name,description\nKhoa CNTT,Khoa Công Nghệ Thông Tin';
        filename = 'template_faculties.csv';
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: 'Invalid template type' });
    }

    if (type === 'users') {
      csvContent =
        'user_id,user_name,email,user_phone,role\nSV001,Nguyen Van A,sv001@example.com,0123456789,student';
    }
    if (type === 'topics') {
      csvContent =
        'topic_title,topic_description,topic_category,topic_major,topic_max_members,topic_creator_id,topic_registration_period\nDe tai mau,Mo ta de tai,TOPIC_CATEGORY_ID,MAJOR_ID,1,GV001,HK1-2024';
    }
    if (type === 'semesters') {
      csvContent = 'school_year_start,school_year_end,semester\n2024,2025,1';
    }
    if (type === 'faculties') {
      csvContent =
        'faculty_title,faculty_description\nKhoa CNTT,Khoa Cong Nghe Thong Tin';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy template' });
  }
};

// Get import history
exports.getImportHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const imports = await SystemLog.find({ action: 'IMPORT_DATA' })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await SystemLog.countDocuments({ action: 'IMPORT_DATA' });

    res.json({
      success: true,
      data: imports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting import history:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử nhập' });
  }
};
