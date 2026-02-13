const axios = require('axios');

const testAPIs = async () => {
  try {
    console.log('🧪 Testing API Endpoints...\n');

    // Test Categories
    console.log('📚 Testing /api/topic-categories...');
    const categoriesRes = await axios.get(
      'http://localhost:5000/api/topic-categories'
    );
    console.log(`✅ Categories API Response:`);
    console.log(`   Status: ${categoriesRes.status}`);
    console.log(`   Count: ${categoriesRes.data.count}`);
    console.log(`   Data length: ${categoriesRes.data.data?.length}`);
    if (categoriesRes.data.data?.length > 0) {
      console.log(
        `   First item: ${categoriesRes.data.data[0].topic_category_title}`
      );
      console.log(
        `   Has description: ${!!categoriesRes.data.data[0].topic_category_description}`
      );
    }

    console.log('\n🎓 Testing /api/majors...');
    const majorsRes = await axios.get('http://localhost:5000/api/majors');
    console.log(`✅ Majors API Response:`);
    console.log(`   Status: ${majorsRes.status}`);
    console.log(`   Count: ${majorsRes.data.count}`);
    console.log(`   Data length: ${majorsRes.data.data?.length}`);
    if (majorsRes.data.data?.length > 0) {
      console.log(
        `   First item: ${majorsRes.data.data[0].major_title} (${majorsRes.data.data[0].major_code})`
      );
      console.log(
        `   Has description: ${!!majorsRes.data.data[0].major_description}`
      );
    }

    console.log('\n✨ All API tests passed!');
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   ⚠️  Backend server is not running!');
      console.error('   Please start the backend with: npm run dev');
    }
  }
};

testAPIs();
