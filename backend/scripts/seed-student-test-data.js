#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../src/models/User');
const Topic = require('../src/models/Topic');
const TopicCategory = require('../src/models/TopicCategory');
const Major = require('../src/models/Major');
const Faculty = require('../src/models/Faculty');
const RegistrationPeriod = require('../src/models/RegistrationPeriod');

const seedStudentTestData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI_TEST ||
        process.env.MONGODB_CONNECTIONSTRING ||
        process.env.MONGODB_URI
    );
    console.log('📦 Connected to database for seeding student test data...');

    // Clear existing data
    await User.deleteMany({});
    await Topic.deleteMany({});
    await TopicCategory.deleteMany({});
    await Major.deleteMany({});
    await Faculty.deleteMany({});
    await RegistrationPeriod.deleteMany({});

    console.log('🧹 Cleared existing data');

    // Create faculty
    const faculty = await Faculty.create({
      faculty_title: 'Công nghệ thông tin',
      faculty_code: 'CNTT',
      faculty_description: 'Khoa Công nghệ Thông tin',
      is_active: true,
    });

    // Create major
    const major = await Major.create({
      major_title: 'Kỹ thuật phần mềm',
      major_code: 'KTPM',
      major_description: 'Ngành Kỹ thuật Phần mềm',
      major_faculty: faculty._id,
      is_active: true,
    });

    // Create topic category
    const category = await TopicCategory.create({
      topic_category_title: 'Ứng dụng Web',
      topic_category_description: 'Các đề tài về phát triển ứng dụng web',
    });

    // Create registration period
    const period = await RegistrationPeriod.create({
      registration_period_semester: 'HK2-2024',
      registration_period_start: new Date('2024-01-01'),
      registration_period_end: new Date('2024-12-31'),
      registration_period_status: 'active',
      allow_registration: true,
      allow_proposal: true,
    });

    // KHÔNG tự hash mật khẩu, để User model tự xử lý

    // Create users
    const admin = await User.create({
      user_id: 'ADMIN001',
      email: 'admin@test.com',
      password: 'password123',
      user_name: 'Admin User',
      role: 'admin',
      user_status: true,
    });

    const teacher = await User.create({
      user_id: 'TEACH001',
      email: 'teacher@test.com',
      password: 'password123',
      user_name: 'Dr. Nguyen Van A',
      role: 'teacher',
      user_status: true,
      user_faculty: faculty._id,
      user_major: major._id,
    });

    const student1 = await User.create({
      user_id: 'STU001',
      email: 'student1@test.com',
      password: 'password123',
      user_name: 'Nguyen Van B',
      role: 'student',
      user_status: true,
      user_faculty: faculty._id,
      user_major: major._id,
    });

    const student2 = await User.create({
      user_id: 'STU002',
      email: 'student2@test.com',
      password: 'password123',
      user_name: 'Tran Thi C',
      role: 'student',
      user_status: true,
      user_faculty: faculty._id,
      user_major: major._id,
    });

    // Create sample topics
    const topics = await Topic.create([
      {
        topic_title: 'Hệ thống quản lý thư viện trực tuyến',
        topic_description:
          'Phát triển hệ thống quản lý thư viện với các chức năng mượn/trả sách, tìm kiếm, quản lý đầu sách.',
        topic_category: category._id,
        topic_major: major._id,
        topic_creator: teacher._id,
        topic_instructor: teacher._id,
        topic_max_members: 3,
        topic_teacher_status: 'approved',
        topic_leader_status: 'approved',
        topic_registration_period: period._id,
        is_active: true,
      },
      {
        topic_title: 'Ứng dụng học tiếng Anh trên di động',
        topic_description:
          'Xây dựng ứng dụng di động giúp học từ vựng, ngữ pháp tiếng Anh với AI hỗ trợ.',
        topic_category: category._id,
        topic_major: major._id,
        topic_creator: student1._id,
        topic_max_members: 2,
        topic_teacher_status: 'pending',
        topic_leader_status: 'pending',
        topic_registration_period: period._id,
        is_active: true,
      },
      {
        topic_title: 'Hệ thống quản lý kho hàng thông minh',
        topic_description:
          'Phát triển hệ thống quản lý kho hàng sử dụng IoT và AI để tối ưu hóa quy trình.',
        topic_category: category._id,
        topic_major: major._id,
        topic_creator: teacher._id,
        topic_instructor: teacher._id,
        topic_max_members: 4,
        topic_teacher_status: 'approved',
        topic_leader_status: 'approved',
        topic_registration_period: period._id,
        is_active: true,
        topic_group_student: [
          {
            student: student1._id,
            status: 'approved',
          },
        ],
      },
    ]);

    console.log('✅ Student test data seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log(`   👨‍💼 Admin: admin@test.com / password123`);
    console.log(`   👨‍🏫 Teacher: teacher@test.com / password123`);
    console.log(`   👨‍🎓 Student 1: student1@test.com / password123`);
    console.log(`   👩‍🎓 Student 2: student2@test.com / password123`);
    console.log('\n📚 Sample Topics:');
    topics.forEach((topic, index) => {
      console.log(
        `   ${index + 1}. ${topic.topic_title} (${topic.topic_teacher_status})`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedStudentTestData();
