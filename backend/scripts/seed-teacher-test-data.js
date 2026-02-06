#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../src/models/User');
const Topic = require('../src/models/Topic');
const TopicCategory = require('../src/models/TopicCategory');
const Major = require('../src/models/Major');
const RegistrationPeriod = require('../src/models/RegistrationPeriod');

const seedTeacherTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to database for seeding teacher test data...');

    // Create additional teacher (avoid duplicate key errors by reusing existing user)
    const hashedPassword = await bcrypt.hash('teacher123', 10);

    let teacher2 = await User.findOne({ email: 'teacher2@test.com' });
    if (!teacher2) {
      teacher2 = await User.create({
        user_id: 'TEA002',
        email: 'teacher2@test.com',
        password: hashedPassword,
        user_name: 'Dr. Tran Thi B',
        role: 'teacher',
        user_status: true,
      });
      console.log('➕ Created teacher2 (teacher2@test.com)');
    } else {
      console.log(
        'ℹ️ teacher2@test.com already exists — reusing existing user'
      );
    }

    // Create categories if not exists
    let category = await TopicCategory.findOne();
    if (!category) {
      category = await TopicCategory.create({
        topic_category_title: 'Web Development',
        topic_category_description: 'Các đề tài phát triển web',
      });
    }

    // Create major if not exists
    let major = await Major.findOne();
    if (!major) {
      major = await Major.create({
        major_title: 'Computer Science',
        major_code: 'CS',
      });
    }

    // Create more topics for teacher
    // Ensure there's a registration period to attach to topics
    let registrationPeriod = await RegistrationPeriod.findOne();
    if (!registrationPeriod) {
      const now = new Date();
      registrationPeriod = await RegistrationPeriod.create({
        registration_period_semester: `${now.getFullYear()}-${Math.ceil((now.getMonth() + 1) / 6)}`,
        registration_period_start: new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        ),
        registration_period_end: new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          now.getDate()
        ),
        registration_period_status: 'active',
        allowed_majors: [major._id],
        created_by: teacher2._id,
      });
    }

    const topics = await Topic.create([
      {
        topic_title: 'Hệ thống E-Learning nâng cao',
        topic_description:
          'Phát triển hệ thống E-Learning tích hợp AI, hệ gợi ý và phân tích học tập để nâng cao hiệu quả học tập của sinh viên.',
        topic_registration_period: registrationPeriod._id,
        topic_category: category._id,
        topic_major: major._id,
        topic_creator: teacher2._id,
        topic_instructor: teacher2._id,
        topic_max_members: 3,
        topic_teacher_status: 'approved',
        is_active: true,
        is_completed: false,
      },
      {
        topic_title: 'Mobile App for Health Tracking',
        topic_description:
          'Ứng dụng di động theo dõi sức khỏe, thu thập dữ liệu từ thiết bị IoT, phân tích và gợi ý lối sống lành mạnh cho người dùng.',
        topic_registration_period: registrationPeriod._id,
        topic_category: category._id,
        topic_major: major._id,
        topic_creator: teacher2._id,
        topic_instructor: teacher2._id,
        topic_max_members: 2,
        topic_teacher_status: 'approved',
        is_active: true,
        is_completed: true,
      },
      {
        topic_title: 'Blockchain-based Voting System',
        topic_description:
          'Hệ thống bỏ phiếu sử dụng công nghệ blockchain để đảm bảo minh bạch, bảo mật và chống gian lận trong quá trình bầu cử.',
        topic_registration_period: registrationPeriod._id,
        topic_category: category._id,
        topic_major: major._id,
        topic_creator: teacher2._id,
        topic_instructor: teacher2._id,
        topic_max_members: 4,
        topic_teacher_status: 'pending',
        is_active: true,
      },
    ]);

    console.log('✅ Teacher test data seeded successfully!');
    console.log('\n📋 Test Teacher Account:');
    console.log(`   👨‍🏫 Teacher 2: teacher2@test.com / teacher123`);
    console.log('\n📚 Added Topics:');
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

seedTeacherTestData();
