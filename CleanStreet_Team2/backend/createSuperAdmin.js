const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@cleanstreet.com' });

    if (existingAdmin) {
      console.log('❌ Admin already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('ℹ️  If you forgot the password, use the forgot password feature.');
      process.exit(0);
    }

    // Create admin with default credentials
    const admin = await Admin.create({
      name: 'CleanStreet Admin',
      email: 'admin@cleanstreet.com',
      password: 'Admin@123',
      isActive: true
    });

    console.log('✅ Admin created successfully!');
    console.log('='.repeat(50));
    console.log('📧 Email: admin@cleanstreet.com');
    console.log('🔑 Password: Admin@123');
    console.log('='.repeat(50));
    console.log('⚠️  IMPORTANT: Please change this password after first login!');
    console.log('🌐 Login at: http://localhost:3001/admin/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB');
  createAdmin();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
