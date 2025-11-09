require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function resetQuota() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node backend/reset-quota.js <email>');
      console.log('Example: node backend/reset-quota.js user@example.com');
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

    console.log('📊 Current Quota Status:');
    console.log('='.repeat(50));
    console.log(`👤 User: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`📊 Daily Limit: ${user.aiQuota.daily}`);
    console.log(`📈 Used: ${user.aiQuota.used}`);
    console.log(`⏰ Reset At: ${new Date(user.aiQuota.resetAt).toLocaleString()}`);
    console.log('='.repeat(50));

    // Reset quota
    user.aiQuota.used = 0;
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    user.aiQuota.resetAt = tomorrow;
    
    await user.save();

    console.log('\n✅ Quota Reset Successfully!\n');
    console.log('📊 New Quota Status:');
    console.log('='.repeat(50));
    console.log(`📊 Daily Limit: ${user.aiQuota.daily}`);
    console.log(`📈 Used: ${user.aiQuota.used}`);
    console.log(`✨ Available: ${user.aiQuota.daily} requests`);
    console.log(`⏰ Next Reset: ${new Date(user.aiQuota.resetAt).toLocaleString()}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

resetQuota();
