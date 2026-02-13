const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const TopicCategory = require('../src/models/TopicCategory');
const Major = require('../src/models/Major');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const categories = await TopicCategory.find({});
    const majors = await Major.find({});

    console.log(`📚 Total Categories in DB: ${categories.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.topic_category_title}`);
      if (cat.topic_category_description) {
        console.log(
          `   └─ ${cat.topic_category_description.substring(0, 70)}...`
        );
      }
    });

    console.log(`\n🎓 Total Majors in DB: ${majors.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    majors.forEach((major, index) => {
      console.log(`${index + 1}. ${major.major_title} (${major.major_code})`);
      if (major.major_description) {
        console.log(`   └─ ${major.major_description.substring(0, 70)}...`);
      }
    });

    console.log('\n✨ Database check completed!');
    console.log('\n⚠️  If frontend only shows 1 item, please:');
    console.log('   1. Check if backend server is running (npm run dev)');
    console.log('   2. Hard refresh the frontend page (Ctrl + Shift + R)');
    console.log('   3. Check browser console for API errors (F12)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkData();
