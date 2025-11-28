const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');
const { hash: hashPassword } = require('../src/lib/passwords');

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    const passwordHash = await hashPassword('admin');

    const admin = await User.create({
      email: 'admin',
      name: 'Administrator',
      passwordHash,
      provider: 'local'
    });

    console.log('✓ Admin user created successfully');
    console.log('  Email: admin');
    console.log('  Password: admin');
    console.log(`  ID: ${admin._id}`);

    await mongoose.connection.close();
    console.log('Done');
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
