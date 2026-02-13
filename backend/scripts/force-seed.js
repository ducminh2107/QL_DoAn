const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const TopicCategory = require('../src/models/TopicCategory');
const Major = require('../src/models/Major');
const Faculty = require('../src/models/Faculty');

const seedData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    // Use the connection string that the backend server uses (Atlas)
    // IMPORTANT: Backend uses MONGODB_CONNECTIONSTRING, so we must prioritize it
    const connectionString =
      process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

    if (!connectionString) {
      throw new Error(
        'No MongoDB connection string found in environment variables (checked MONGODB_CONNECTIONSTRING and MONGODB_URI)'
      );
    }

    console.log(
      `🔌 Connection String (first 20 chars): ${connectionString.substring(0, 20)}...`
    );
    await mongoose.connect(connectionString);
    console.log(
      `✅ Connected to: ${mongoose.connection.name} (Host: ${mongoose.connection.host})`
    );

    // Check current counts
    const currentCats = await TopicCategory.countDocuments();
    const currentMajors = await Major.countDocuments();

    console.log(
      `📊 Current Status: ${currentCats} Categories, ${currentMajors} Majors`
    );

    // Force clear
    console.log('🗑️  Clearing existing data...');
    await TopicCategory.deleteMany({});
    await Major.deleteMany({});

    // Find or create Faculty
    let itFaculty = await Faculty.findOne({ faculty_code: 'CNTT' });
    if (!itFaculty) {
      console.log('🏛️  Creating IT Faculty...');
      itFaculty = await Faculty.create({
        faculty_title: 'Khoa Công nghệ Thông tin',
        faculty_code: 'CNTT',
        is_active: true,
      });
    }

    // Insert 12 Categories
    console.log('📚 Seeding 12 Categories...');
    await TopicCategory.insertMany([
      {
        topic_category_title: 'Phát triển Web & Mobile',
        topic_category_description: 'Các đề tài về Web, Mobile App',
      },
      {
        topic_category_title: 'Trí tuệ nhân tạo & AI',
        topic_category_description: 'Machine Learning, Deep Learning, NLP',
      },
      {
        topic_category_title: 'An toàn thông tin',
        topic_category_description: 'Bảo mật mạng, Cryptography',
      },
      {
        topic_category_title: 'Internet of Things (IoT)',
        topic_category_description: 'Hệ thống nhúng, Smart Home',
      },
      {
        topic_category_title: 'Big Data & Data Science',
        topic_category_description: 'Phân tích dữ liệu lớn',
      },
      {
        topic_category_title: 'Cloud Computing',
        topic_category_description: 'AWS, Azure, Docker, DevOps',
      },
      {
        topic_category_title: 'Game Development',
        topic_category_description: 'Unity, Unreal Engine',
      },
      {
        topic_category_title: 'Hệ thống thông tin',
        topic_category_description: 'ERP, CRM, Quản lý doanh nghiệp',
      },
      {
        topic_category_title: 'Mạng máy tính',
        topic_category_description: 'Network protocols, SDN',
      },
      {
        topic_category_title: 'Blockchain',
        topic_category_description: 'Smart contracts, DApps',
      },
      {
        topic_category_title: 'Xử lý ảnh',
        topic_category_description: 'Computer Vision',
      },
      {
        topic_category_title: 'Tự động hóa',
        topic_category_description: 'Robotics',
      },
    ]);

    // Insert 10 Majors
    console.log('🎓 Seeding 10 Majors...');
    await Major.insertMany([
      {
        major_title: 'Công nghệ Thông tin',
        major_code: 'CNTT',
        major_faculty: itFaculty._id,
      },
      {
        major_title: 'Khoa học Máy tính',
        major_code: 'KHMT',
        major_faculty: itFaculty._id,
      },
      {
        major_title: 'Kỹ thuật Phần mềm',
        major_code: 'KTPM',
        major_faculty: itFaculty._id,
      },
      {
        major_title: 'An toàn Thông tin',
        major_code: 'ATTT',
        major_faculty: itFaculty._id,
      },
      {
        major_title: 'Hệ thống Thông tin',
        major_code: 'HTTT',
        major_faculty: itFaculty._id,
      },
      {
        major_title: 'Trí tuệ Nhân tạo',
        major_code: 'TTNT',
        major_faculty: itFaculty._id,
      },
      {
        major_title: 'Khoa học Dữ liệu',
        major_code: 'KHDL',
        major_faculty: itFaculty._id,
      },
      {
        major_title: 'Mạng & Truyền thông',
        major_code: 'MMT',
        major_faculty: itFaculty._id,
      },
      {
        major_title: 'Internet of Things',
        major_code: 'IOT',
        major_faculty: itFaculty._id,
      },
      {
        major_title: 'Đa phương tiện',
        major_code: 'DPT',
        major_faculty: itFaculty._id,
      },
    ]);

    console.log('✨ DONE! Please refresh your browser now.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedData();
