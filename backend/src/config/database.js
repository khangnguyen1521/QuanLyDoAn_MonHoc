const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Debug: Kiểm tra biến môi trường
    console.log('🔍 Checking environment variables...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI (first 50 chars):', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    // Kiểm tra MONGODB_URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI không được định nghĩa trong file .env');
    }

    // Thêm timeout và retry options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      // Removed deprecated options: bufferMaxEntries and bufferCommands
    });

    console.log(`🍃 MongoDB kết nối thành công: ${conn.connection.host}`);
    
    // Lắng nghe các sự kiện kết nối
    mongoose.connection.on('error', (err) => {
      console.error('❌ Lỗi MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB đã ngắt kết nối');
    });

    // Xử lý khi ứng dụng đóng
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 Kết nối MongoDB đã đóng do ứng dụng kết thúc');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
