// bringing mongoose and dotenv here
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// function to connect mongo
async function connectMongoose() {
  try {
    // trying to connect with mongo uri from env file
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'mern_assignment', // if db name not there, use default one
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    // if something goes wrong, print error
    console.error('MongoDB connection error:', err.message);
  }
}

// exporting so we can use it anywhere
module.exports = { connectMongoose };
