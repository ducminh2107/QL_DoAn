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
    const majors = await Major.find({}).populate('major_faculty');

    console.log(`📚 Total Categories: ${categories.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.topic_category_title}`);
      if (cat.topic_category_description) {
        console.log(
          `   └─ ${cat.topic_category_description.substring(0, 60)}...`
        );
      }
    });

    console.log(`\n🎓 Total Majors: ${majors.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    majors.forEach((major, index) => {
      console.log(`${index + 1}. ${major.major_title} (${major.major_code})`);
      if (major.major_description) {
        console.log(`   └─ ${major.major_description.substring(0, 60)}...`);
      }
    });

    console.log('\n✨ Check completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();
