const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const TopicCategory = require('../src/models/TopicCategory');
const Major = require('../src/models/Major');
const Faculty = require('../src/models/Faculty');

// Comprehensive Topic Categories for IT/CS field
const categories = [
  {
    topic_category_title: 'Phát triển Web & Mobile',
    topic_category_description:
      'Các đề tài liên quan đến xây dựng ứng dụng web, mobile app, progressive web app và các công nghệ frontend/backend hiện đại',
  },
  {
    topic_category_title: 'Trí tuệ nhân tạo & Machine Learning',
    topic_category_description:
      'Nghiên cứu và ứng dụng AI, ML, Deep Learning, Computer Vision, NLP và các thuật toán thông minh',
  },
  {
    topic_category_title: 'An toàn & Bảo mật thông tin',
    topic_category_description:
      'Các đề tài về mật mã học, bảo mật mạng, phát hiện xâm nhập, blockchain và các giải pháp bảo vệ dữ liệu',
  },
  {
    topic_category_title: 'Internet of Things (IoT)',
    topic_category_description:
      'Ứng dụng IoT trong smart home, nông nghiệp thông minh, y tế, giao thông và các hệ thống nhúng',
  },
  {
    topic_category_title: 'Big Data & Data Science',
    topic_category_description:
      'Phân tích dữ liệu lớn, khai phá dữ liệu, business intelligence, data visualization và dự báo xu hướng',
  },
  {
    topic_category_title: 'Cloud Computing & DevOps',
    topic_category_description:
      'Triển khai ứng dụng trên cloud (AWS, Azure, GCP), containerization, CI/CD và quản lý hạ tầng',
  },
  {
    topic_category_title: 'Game Development',
    topic_category_description:
      'Phát triển game 2D/3D, game engine, AR/VR gaming và các công nghệ giải trí tương tác',
  },
  {
    topic_category_title: 'Hệ thống thông tin quản lý',
    topic_category_description:
      'Xây dựng các hệ thống ERP, CRM, quản lý doanh nghiệp, quản lý giáo dục và các phần mềm nghiệp vụ',
  },
  {
    topic_category_title: 'Mạng máy tính & Hệ thống phân tán',
    topic_category_description:
      'Nghiên cứu về giao thức mạng, SDN, NFV, microservices và các kiến trúc hệ thống phân tán',
  },
  {
    topic_category_title: 'Blockchain & Cryptocurrency',
    topic_category_description:
      'Ứng dụng blockchain, smart contract, DeFi, NFT và các giải pháp phi tập trung',
  },
  {
    topic_category_title: 'Xử lý ảnh & Thị giác máy tính',
    topic_category_description:
      'Nhận dạng khuôn mặt, phát hiện đối tượng, xử lý ảnh y tế, OCR và các ứng dụng computer vision',
  },
  {
    topic_category_title: 'Robotics & Automation',
    topic_category_description:
      'Robot tự hành, tay máy công nghiệp, drone và các hệ thống tự động hóa thông minh',
  },
];

// Comprehensive Majors for IT Faculty
const majors = [
  {
    major_title: 'Công nghệ Thông tin',
    major_code: 'CNTT',
    major_description:
      'Đào tạo kỹ sư có kiến thức toàn diện về phát triển phần mềm, hệ thống thông tin và công nghệ mạng',
    duration_years: 4,
    total_credits: 140,
  },
  {
    major_title: 'Khoa học Máy tính',
    major_code: 'KHMT',
    major_description:
      'Chuyên sâu về thuật toán, lý thuyết tính toán, trí tuệ nhân tạo và các nền tảng khoa học máy tính',
    duration_years: 4,
    total_credits: 140,
  },
  {
    major_title: 'Kỹ thuật Phần mềm',
    major_code: 'KTPM',
    major_description:
      'Tập trung vào quy trình phát triển phần mềm, kiến trúc hệ thống, quản lý dự án và đảm bảo chất lượng',
    duration_years: 4,
    total_credits: 140,
  },
  {
    major_title: 'An toàn Thông tin',
    major_code: 'ATTT',
    major_description:
      'Đào tạo chuyên gia bảo mật mạng, mật mã học, phòng chống tấn công mạng và quản lý rủi ro an ninh',
    duration_years: 4,
    total_credits: 140,
  },
  {
    major_title: 'Hệ thống Thông tin',
    major_code: 'HTTT',
    major_description:
      'Phát triển và quản lý các hệ thống thông tin doanh nghiệp, phân tích nghiệp vụ và tư vấn giải pháp',
    duration_years: 4,
    total_credits: 140,
  },
  {
    major_title: 'Trí tuệ Nhân tạo',
    major_code: 'TTNT',
    major_description:
      'Nghiên cứu và ứng dụng AI, machine learning, deep learning và các hệ thống thông minh',
    duration_years: 4,
    total_credits: 140,
  },
  {
    major_title: 'Khoa học Dữ liệu',
    major_code: 'KHDL',
    major_description:
      'Phân tích dữ liệu lớn, khai phá dữ liệu, business intelligence và ra quyết định dựa trên dữ liệu',
    duration_years: 4,
    total_credits: 140,
  },
  {
    major_title: 'Mạng máy tính & Truyền thông',
    major_code: 'MMT',
    major_description:
      'Thiết kế, triển khai và quản trị hệ thống mạng, viễn thông và hạ tầng công nghệ thông tin',
    duration_years: 4,
    total_credits: 140,
  },
  {
    major_title: 'Internet of Things',
    major_code: 'IOT',
    major_description:
      'Phát triển các hệ thống IoT, thiết bị thông minh và ứng dụng trong smart city, công nghiệp 4.0',
    duration_years: 4,
    total_credits: 140,
  },
  {
    major_title: 'Công nghệ Đa phương tiện',
    major_code: 'CNĐPT',
    major_description:
      'Xử lý ảnh, video, âm thanh, đồ họa máy tính, game development và các ứng dụng giải trí số',
    duration_years: 4,
    total_credits: 140,
  },
];

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create IT Faculty
    let itFaculty = await Faculty.findOne({ faculty_code: 'CNTT' });

    if (!itFaculty) {
      itFaculty = await Faculty.create({
        faculty_title: 'Khoa Công nghệ Thông tin',
        faculty_code: 'CNTT',
        faculty_description:
          'Khoa đào tạo các chuyên ngành về Công nghệ Thông tin, Khoa học Máy tính và các lĩnh vực liên quan',
        is_active: true,
      });
      console.log('✅ Created IT Faculty');
    } else {
      console.log('ℹ️  IT Faculty already exists');
    }

    // Clear existing data
    await TopicCategory.deleteMany({});
    console.log('🗑️  Cleared existing topic categories');

    await Major.deleteMany({});
    console.log('🗑️  Cleared existing majors');

    // Insert categories
    const insertedCategories = await TopicCategory.insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.length} topic categories`);

    // Add faculty reference to majors
    const majorsWithFaculty = majors.map((major) => ({
      ...major,
      major_faculty: itFaculty._id,
    }));

    // Insert majors
    const insertedMajors = await Major.insertMany(majorsWithFaculty);
    console.log(`✅ Inserted ${insertedMajors.length} majors`);

    console.log('\n📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Topic Categories:');
    insertedCategories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.topic_category_title}`);
    });
    console.log('\nMajors:');
    insertedMajors.forEach((major, index) => {
      console.log(`  ${index + 1}. ${major.major_title} (${major.major_code})`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
