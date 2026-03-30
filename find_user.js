const dns = require('dns').promises;
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function findOrUpdateUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    let user = await User.findOne({});
    if (user) {
      console.log('Existing User Found:');
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      
      // Since we can't see the password, we can update it to something simple for testing
      const testPass = 'admin123';
      user.password = testPass;
      await user.save();
      console.log(`Password updated to: ${testPass}`);
    } else {
      console.log('No users found. Creating a test user...');
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      await testUser.save();
      console.log('Created User: test@example.com / password123');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err);
  }
}

findOrUpdateUser();
