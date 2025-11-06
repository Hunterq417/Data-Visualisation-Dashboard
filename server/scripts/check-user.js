const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shivanshbhardwaj2015_db_user:bbbbbbbb@cluster0.zda2259.mongodb.net/';

async function checkUser() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'admin' });
    
    if (user) {
      console.log('User found:');
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  Provider:', user.provider);
      console.log('  PasswordHash exists:', !!user.passwordHash);
      console.log('  GoogleId:', user.googleId);
      console.log('  CreatedAt:', user.createdAt);
    } else {
      console.log('No user found with email "admin"');
    }

    await mongoose.connection.close();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();