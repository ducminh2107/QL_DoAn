const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('⏳ Đang kết nối tới MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout sau 5 giây nếu không kết nối được
    });

    console.log(`✅ Kết nối CSDL thành công!: ${conn.connection.host}`);

    // Xử lý events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
