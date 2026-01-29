const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/cleanstreet';

async function viewDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('='.repeat(60));
    console.log('DATABASE: cleanstreet');
    console.log('='.repeat(60));

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));

    // View Users
    console.log('\n' + '='.repeat(60));
    console.log('👥 USERS COLLECTION');
    console.log('='.repeat(60));
    
    const users = await User.find().select('-password');
    
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.log(`\nTotal Users: ${users.length}\n`);
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  ID:           ${user._id}`);
        console.log(`  Name:         ${user.name}`);
        console.log(`  Username:     ${user.username || 'Not set'}`);
        console.log(`  Email:        ${user.email}`);
        console.log(`  Phone:        ${user.phoneNumber || 'Not set'}`);
        console.log(`  Location:     ${user.location || 'Not set'}`);
        console.log(`  Role:         ${user.role}`);
        console.log(`  Created At:   ${user.createdAt}`);
        console.log(`  Profile Photo: ${user.profilePhoto || 'Not set'}`);
        console.log('-'.repeat(60));
      });
    }

    // View Complaints (if model exists)
    try {
      const Complaint = require('./models/Complaint');
      console.log('\n' + '='.repeat(60));
      console.log('📋 COMPLAINTS COLLECTION');
      console.log('='.repeat(60));
      
      const complaints = await Complaint.find().populate('userId', 'name email');
      
      if (complaints.length === 0) {
        console.log('No complaints found in database.');
      } else {
        console.log(`\nTotal Complaints: ${complaints.length}\n`);
        complaints.forEach((complaint, index) => {
          console.log(`Complaint ${index + 1}:`);
          console.log(`  ID:          ${complaint._id}`);
          console.log(`  Title:       ${complaint.title}`);
          console.log(`  Description: ${complaint.description?.substring(0, 50)}...`);
          console.log(`  Category:    ${complaint.category}`);
          console.log(`  Status:      ${complaint.status}`);
          console.log(`  Location:    ${complaint.location}`);
          console.log(`  Created By:  ${complaint.userId?.name || 'Unknown'}`);
          console.log(`  Created At:  ${complaint.createdAt}`);
          console.log('-'.repeat(60));
        });
      }
    } catch (err) {
      console.log('Complaints collection not accessible or empty.');
    }

    console.log('\n✅ Database view complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

viewDatabase();
