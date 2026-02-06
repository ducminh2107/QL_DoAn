#!/usr/bin/env node

const User = require('../src/models/User');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

/**
 * Test: Simulate login and /me endpoint
 */
const testLoginFlow = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to database\n');

    // Step 1: Find user
    const user = await User.findOne({ email: 'teacher2@test.com' }).select(
      '+password'
    );
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ Step 1: User found');
    console.log('   Email:', user.email);
    console.log('   Role in DB:', user.role);

    // Step 2: Generate token (simulating login)
    const token = user.generateAuthToken();
    console.log('\n✅ Step 2: Token generated');
    console.log('   Token length:', token.length);

    // Step 3: Decode token to check
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('\n✅ Step 3: Token decoded');
    console.log('   Decoded ID:', decoded.id);
    console.log('   Decoded expires:', new Date(decoded.exp * 1000));

    // Step 4: Find user by token ID (simulating /me endpoint)
    const userFromToken = await User.findById(decoded.id);
    console.log('\n✅ Step 4: User fetched from token ID');
    console.log('   Email:', userFromToken.email);
    console.log('   Role from DB:', userFromToken.role);

    // Step 5: Check if role is correct
    if (userFromToken.role === 'teacher') {
      console.log('\n✅ SUCCESS: User has teacher role!');
      console.log('   Frontend should have access to /teacher routes');
    } else {
      console.log(
        '\n❌ FAILED: User role is',
        userFromToken.role,
        'not teacher!'
      );
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testLoginFlow();
