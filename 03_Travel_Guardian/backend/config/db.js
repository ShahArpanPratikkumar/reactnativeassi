// MongoDB Connection Configuration
// Connects Mongoose to MongoDB Atlas or local MongoDB instance

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MONGO_URI from .env, or fall back to local MongoDB
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelguardian';

    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the process if database cannot connect (critical failure)
    process.exit(1);
  }
};

module.exports = connectDB;
