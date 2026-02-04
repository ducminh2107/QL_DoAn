#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../src/models/User');

const seedUsers = async () => {
  try {
    // Dùng cùng connection string với server để seed đúng database
    await mongoose.connect(
      process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI
    );
    console.log('📦 Connected to database for seeding users...');

    // Clear existing users
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    // LƯU Ý: KHÔNG tự hash mật khẩu ở đây.
    // User model đã có hook pre('save') để hash password.

    // Create admin user
    const adminUser = await User.create({
      user_id: 'ADMIN001',
      email: 'admin@thesis.edu.vn',
      password: 'admin123',
      user_name: 'System Administrator',
      role: 'admin',
      user_status: true,
      user_phone: '0987654321',
    });

    // Create teacher user
    const teacherUser = await User.create({
      user_id: 'TEACH001',
      email: 'teacher@thesis.edu.vn',
      password: 'teacher123',
      user_name: 'Dr. Nguyen Van A',
      role: 'teacher',
      user_status: true,
      user_phone: '0912345678',
      user_faculty: 'Công nghệ thông tin',
      user_department: 'Khoa học máy tính',
    });

    // Create student user
    const studentUser = await User.create({
      user_id: 'STU001',
      email: 'student@thesis.edu.vn',
      password: 'student123',
      user_name: 'Nguyen Van B',
      role: 'student',
      user_status: true,
      user_phone: '0901234567',
      user_faculty: 'Công nghệ thông tin',
      user_department: 'Khoa học máy tính',
      user_major: 'Kỹ thuật phần mềm',
      user_average_grade: 3.2,
    });

    console.log('👥 Created test users:');
    console.log(`  👨‍💼 Admin: ${adminUser.email} / admin123`);
    console.log(`  👨‍🏫 Teacher: ${teacherUser.email} / teacher123`);
    console.log(`  👨‍🎓 Student: ${studentUser.email} / student123`);

    console.log('✅ User seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedUsers();
