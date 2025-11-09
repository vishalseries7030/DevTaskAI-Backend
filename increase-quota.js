require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function increaseQuota() {
  try {
    const email = process.argv[2];
    const newLimit = parseInt(process.argv[3]);
    
    if (!email || !newLimit) {
      console.log('❌ Please provide email and new quota limit');
      console.log('Usage: node backend/increase-quota.js <email> <new_limit>');
      console.log('Example: node backend/increase-quota.js user@example.com 10');
      process.exit(1);
    }

    if (isNaN(newLimit) || newLimit < 1) {
      console.log('❌ New limit must be a positive number');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log('📊 Current Quota:');
    console.log('='.repeat(50));
    console.log(`👤 User: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`📊 Daily Limit: ${user.aiQuota.daily}`);
    console.log(`📈 Used: ${user.aiQuota.used}`);
    console.log('='.repeat(50));

    // Update quota limit
    user.aiQuota.daily = newLimit;
    await user.save();

    console.log('\n✅ Quota Limit Updated!\n');
    console.log('📊 New Quota:');
    console.log('='.repeat(50));
    console.log(`📊 Daily Limit: ${user.aiQuota.daily}`);
    console.log(`📈 Used: ${user.aiQuota.used}`);
    console.log(`✨ Available: ${user.aiQuota.daily - user.aiQuota.used} requests`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

increaseQuota();
