const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');
const { hash: hashPassword } = require('../src/lib/passwords');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shivanshbhardwaj2015_db_user:bbbbbbbb@cluster0.zda2259.mongodb.net/';

async function resetAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin' });
    
    if (existingAdmin) {
      console.log('Deleting existing admin user...');
      await User.deleteOne({ email: 'admin' });
    }

    const passwordHash = await hashPassword('admin');
    
    const admin = await User.create({
      email: 'admin',
      name: 'Administrator',
      passwordHash,
      provider: 'local'
    });

    console.log('✓ Admin user recreated successfully');
    console.log('  Email: admin');
    console.log('  Password: admin');
    console.log(`  ID: ${admin._id}`);

    // Test the password verification
    const isValid = await hashPassword('admin').then(hash => {
      return require('../src/lib/passwords').verify('admin', hash);
    });
    console.log('Password verification test:', isValid);

    await mongoose.connection.close();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdmin();