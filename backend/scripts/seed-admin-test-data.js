#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../src/models/User');

const seedAdminTestData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI_TEST ||
        process.env.MONGODB_CONNECTIONSTRING ||
        process.env.MONGODB_URI
    );
    console.log('📦 Connected to database for seeding admin test data...');

    // Create test admin users
    const adminUsers = [
      {
        user_id: 'ADMIN001',
        email: 'admin@test.com',
        password: 'admin123',
        user_name: 'Quản trị viên chính',
        role: 'admin',
        user_status: true,
        user_phone: '0123456789',
        user_permanent_address: 'Hà Nội, Việt Nam',
      },
      {
        user_id: 'ADMIN002',
        email: 'admin2@test.com',
        password: 'admin123',
        user_name: 'Quản trị viên cấp 2',
        role: 'admin',
        user_status: true,
        user_phone: '0987654321',
        user_permanent_address: 'TP Hồ Chí Minh, Việt Nam',
      },
      {
        user_id: 'ADMIN003',
        email: 'admin3@test.com',
        password: 'admin123',
        user_name: 'Quản trị viên tài chính',
        role: 'admin',
        user_status: true,
        user_phone: '0912345678',
        user_permanent_address: 'Đà Nẵng, Việt Nam',
      },
      {
        user_id: 'ADMIN004',
        email: 'admin4@test.com',
        password: 'admin123',
        user_name: 'Quản trị viên hỗ trợ',
        role: 'admin',
        user_status: true,
        user_phone: '0903456789',
        user_permanent_address: 'Cần Thơ, Việt Nam',
      },
    ];

    // Check if admins already exist
    const existingAdmins = await User.find({
      role: 'admin',
      email: { $in: adminUsers.map((a) => a.email) },
    });

    if (existingAdmins.length > 0) {
      console.log(
        `⚠️  Found ${existingAdmins.length} existing admin(s). Deleting old data...`
      );
      await User.deleteMany({
        role: 'admin',
        email: { $in: adminUsers.map((a) => a.email) },
      });
    }

    // Create admin users
    const createdAdmins = await User.create(adminUsers);
    console.log(`✅ Created ${createdAdmins.length} admin users:`);

    createdAdmins.forEach((admin) => {
      console.log(
        `   👤 ${admin.user_id} - ${admin.user_name} (${admin.email})`
      );
    });

    console.log('\n✨ Admin test data seeding completed successfully!');
    console.log(
      '\n📋 Login credentials for testing:\n   Email: admin@test.com\n   Password: admin123'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin test data:', error.message);
    process.exit(1);
  }
};

seedAdminTestData();
