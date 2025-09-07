const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n📋 To fix this issue:');
    console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('2. Start MongoDB service');
    console.log('3. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    console.log('4. Update MONGODB_URI in your .env file\n');
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Running in development mode without database connection');
      console.log('Some features will not work until database is connected\n');
    }
  }
};

module.exports = connectDB;
