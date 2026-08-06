const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/krishiai';
    const conn = await mongoose.connect(connStr, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Non-fatal logging for dev fallbacks if running without MongoDB service active
  }
};

module.exports = connectDB;
