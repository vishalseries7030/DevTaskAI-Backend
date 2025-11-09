require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkQuota() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      process.exit(0);
    }

    console.log('📊 AI Quota Status:\n');
    console.log('='.repeat(70));
    
    users.forEach((user, index) => {
      const remaining = user.aiQuota.daily - user.aiQuota.used;
      const resetDate = new Date(user.aiQuota.resetAt);
      
      console.log(`\n👤 User ${index + 1}: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Daily Limit: ${user.aiQuota.daily} requests`);
      console.log(`   Used Today: ${user.aiQuota.used} requests`);
      console.log(`   Remaining: ${remaining} requests`);
      console.log(`   Resets At: ${resetDate.toLocaleString()}`);
      
      if (remaining === 0) {
        console.log(`   ⚠️  QUOTA EXHAUSTED - No AI requests available`);
      } else if (remaining === 1) {
        console.log(`   ⚡ Only 1 request remaining`);
      } else {
        console.log(`   ✅ ${remaining} requests available`);
      }
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('\n💡 To reset quota manually, run: node backend/reset-quota.js <email>');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

checkQuota();
