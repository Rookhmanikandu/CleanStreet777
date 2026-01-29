const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const User = require('./models/User');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanstreet';

async function checkLocations() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('='.repeat(80));
    console.log('🗺️  CHECKING COMPLAINT LOCATIONS');
    console.log('='.repeat(80));

    const complaints = await Complaint.find().populate('user_id', 'name email');
    
    if (complaints.length === 0) {
      console.log('❌ No complaints found in database.');
      return;
    }

    console.log(`\n📊 Total Complaints: ${complaints.length}\n`);

    let validLocations = 0;
    let invalidLocations = 0;
    let defaultLocations = 0;

    complaints.forEach((complaint, index) => {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`Complaint #${index + 1}`);
      console.log(`${'─'.repeat(80)}`);
      console.log(`ID:           ${complaint._id}`);
      console.log(`Title:        ${complaint.title}`);
      console.log(`Address:      ${complaint.address || 'Not set'}`);
      console.log(`User:         ${complaint.user_id?.name || 'Unknown'}`);
      console.log(`Created:      ${complaint.created_at}`);
      
      console.log(`\n📍 Location Data:`);
      
      if (!complaint.location_coords) {
        console.log(`  ❌ NO LOCATION_COORDS FIELD`);
        invalidLocations++;
      } else {
        console.log(`  Type:        ${complaint.location_coords.type}`);
        console.log(`  Coordinates: ${JSON.stringify(complaint.location_coords.coordinates)}`);
        
        if (complaint.location_coords.coordinates && 
            Array.isArray(complaint.location_coords.coordinates) &&
            complaint.location_coords.coordinates.length === 2) {
          
          const [lng, lat] = complaint.location_coords.coordinates;
          
          if (lng === 0 && lat === 0) {
            console.log(`  ⚠️  DEFAULT/INVALID: [0, 0] - NO LOCATION SET`);
            defaultLocations++;
          } else if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
            console.log(`  ❌ INVALID: Coordinates out of range`);
            invalidLocations++;
          } else {
            console.log(`  ✅ VALID`);
            console.log(`  Format for DB:  [lng, lat] = [${lng}, ${lat}]`);
            console.log(`  Format for Map: [lat, lng] = [${lat}, ${lng}]`);
            
            // Check if within India
            if (lat >= 6.4626999 && lat <= 35.513327 && 
                lng >= 68.1097 && lng <= 97.39535) {
              console.log(`  🇮🇳 Location is in India`);
            } else {
              console.log(`  🌍 Location is outside India`);
            }
            validLocations++;
          }
        } else {
          console.log(`  ❌ INVALID: Coordinates array is malformed`);
          invalidLocations++;
        }
      }
      
      console.log(`\n📸 Photos: ${complaint.photo?.length || 0} image(s)`);
      console.log(`👍 Upvotes: ${complaint.upvotes || 0} | 👎 Downvotes: ${complaint.downvotes || 0}`);
      console.log(`📊 Status: ${complaint.status} | Priority: ${complaint.priority}`);
    });

    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 LOCATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Valid Locations:    ${validLocations}`);
    console.log(`⚠️  Default [0,0]:      ${defaultLocations}`);
    console.log(`❌ Invalid/Missing:    ${invalidLocations}`);
    console.log(`📋 Total Complaints:   ${complaints.length}`);
    console.log('='.repeat(80));

    if (defaultLocations > 0 || invalidLocations > 0) {
      console.log(`\n⚠️  WARNING: ${defaultLocations + invalidLocations} complaint(s) will not show map!`);
      console.log(`\n💡 To fix:`);
      console.log(`   1. These complaints were created without selecting a location on the map`);
      console.log(`   2. Edit the complaint and click on the map to set a proper location`);
      console.log(`   3. Or update location_coords in MongoDB directly\n`);
    } else if (validLocations === complaints.length) {
      console.log(`\n✅ All complaints have valid locations! Maps should display correctly.\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkLocations();
