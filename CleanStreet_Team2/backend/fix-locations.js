const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanstreet';

// Function to geocode address to coordinates
async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=in&limit=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      
      // Verify it's in India
      if (lat >= 6.4626999 && lat <= 35.513327 && 
          lon >= 68.1097 && lon <= 97.39535) {
        return { type: 'Point', coordinates: [lon, lat] };
      }
    }
    return null;
  } catch (error) {
    console.error(`❌ Geocoding failed for "${address}":`, error.message);
    return null;
  }
}

async function fixLocations() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('='.repeat(80));
    console.log('🔧 FIXING COMPLAINT LOCATIONS');
    console.log('='.repeat(80));

    const complaints = await Complaint.find();
    
    if (complaints.length === 0) {
      console.log('❌ No complaints found in database.');
      return;
    }

    console.log(`\n📊 Total Complaints: ${complaints.length}\n`);

    let fixed = 0;
    let skipped = 0;
    let failed = 0;

    for (const complaint of complaints) {
      const isInvalid = !complaint.location_coords || 
                       !complaint.location_coords.coordinates ||
                       (complaint.location_coords.coordinates[0] === 0 && 
                        complaint.location_coords.coordinates[1] === 0);

      if (!isInvalid) {
        console.log(`✅ Skipping "${complaint.title}" - Already has valid location`);
        skipped++;
        continue;
      }

      console.log(`\n${'─'.repeat(80)}`);
      console.log(`🔍 Processing: "${complaint.title}"`);
      console.log(`   Address: ${complaint.address}`);
      console.log(`   Current: [0, 0] (invalid)`);

      if (!complaint.address || complaint.address.trim() === '') {
        console.log(`   ⚠️  No address available - cannot geocode`);
        failed++;
        continue;
      }

      console.log(`   🔄 Geocoding address...`);
      
      // Add delay to respect rate limits (1 request per second)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCoords = await geocodeAddress(complaint.address);

      if (newCoords) {
        complaint.location_coords = newCoords;
        await complaint.save();
        
        console.log(`   ✅ Fixed! New coordinates: [${newCoords.coordinates[0]}, ${newCoords.coordinates[1]}]`);
        console.log(`   📌 Map display: [lat: ${newCoords.coordinates[1]}, lng: ${newCoords.coordinates[0]}]`);
        fixed++;
      } else {
        console.log(`   ❌ Failed to geocode address`);
        failed++;
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 FIX SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Fixed:         ${fixed}`);
    console.log(`⏭️  Skipped:       ${skipped} (already valid)`);
    console.log(`❌ Failed:        ${failed}`);
    console.log(`📋 Total:         ${complaints.length}`);
    console.log('='.repeat(80));

    if (fixed > 0) {
      console.log(`\n✅ Successfully fixed ${fixed} complaint location(s)!`);
      console.log(`💡 Maps should now display correctly for these complaints.\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed.\n');
    process.exit(0);
  }
}

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                     COMPLAINT LOCATION FIX TOOL                            ║
║                                                                            ║
║  This script will:                                                         ║
║  1. Find all complaints with invalid [0, 0] coordinates                    ║
║  2. Use their addresses to geocode proper coordinates                      ║
║  3. Update the database with correct location data                         ║
║                                                                            ║
║  Note: This uses OpenStreetMap Nominatim API with 1 req/sec limit         ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

fixLocations();
