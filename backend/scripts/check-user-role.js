// Script kiểm tra role của user
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../src/models/User');

const checkUserRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to database...\n');

    // Check teacher2@test.com
    const user = await User.findOne({ email: 'teacher2@test.com' });

    if (!user) {
      console.log('❌ User teacher2@test.com not found in database');
      process.exit(1);
    }

    console.log('👤 User Found:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.user_name);
    console.log('   Role:', user.role);
    console.log('   Status:', user.user_status);

    if (user.role === 'teacher') {
      console.log('\n✅ Role is "teacher" - Should have access!');
    } else {
      console.log('\n❌ Role is "' + user.role + '" - NOT a teacher!');
      console.log('   Updating role to "teacher"...');

      user.role = 'teacher';
      await user.save();

      console.log('✅ Role updated to "teacher"!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUserRole();
