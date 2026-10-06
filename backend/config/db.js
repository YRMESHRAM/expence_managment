const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_management';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(` Local MongoDB connection failed at ${uri} (${err.message}).`);
    console.log(' Starting in-memory MongoDB fallback for instant local operation...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'expense_management',
        },
      });
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(` In-Memory MongoDB Connected successfully: ${conn.connection.host}`);
    } catch (memErr) {
      console.error(' Failed to initialize database fallback:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
