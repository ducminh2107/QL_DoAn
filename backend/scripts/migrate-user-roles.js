#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../src/models/User');

/**
 * Migration: Ensure all users have a role set (default to 'student')
 */
const migrateUserRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to database for migration...\n');

    // Find users without role
    const usersWithoutRole = await User.find({ role: { $exists: false } });

    if (usersWithoutRole.length === 0) {
      console.log('✅ All users already have a role set');
      process.exit(0);
    }

    console.log(`⚠️  Found ${usersWithoutRole.length} users without role\n`);

    // Update each user
    for (const user of usersWithoutRole) {
      console.log(`Updating ${user.email}...`);
      user.role = 'student'; // Default role
      await user.save();
      console.log(`   ✅ Role set to: student`);
    }

    console.log(
      `\n✅ Migration complete! Updated ${usersWithoutRole.length} users`
    );

    // List all users with roles
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}).select('email role user_name');
    allUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} → role: "${u.role}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
};

migrateUserRoles();
