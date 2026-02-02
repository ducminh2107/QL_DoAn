#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Import models (tạm thời để test)
const User = require('../src/models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log('📦 Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      user_id: 'ADMIN001',
      email: 'admin@thesis.edu.vn',
      password: hashedPassword,
      user_name: 'System Administrator',
      role: 'admin',
      user_status: true,
    });

    console.log('👨‍💼 Created admin user:', adminUser.email);
    console.log('✅ Database seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
