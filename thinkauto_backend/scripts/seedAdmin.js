import 'dotenv/config';
import User from '../models/User.js';
import connectDB from '../config/database.js';

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Delete existing admin user if exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      await User.deleteOne({ email: process.env.ADMIN_EMAIL });
      console.log('🗑️  Deleted existing admin user');
    }

    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      username: 'sudhanadmin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      department: 'IT Administration',
      phoneNumber: '+1234567890',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log(`\n📧 Email: ${admin.email}`);
    console.log(`👤 Username: ${admin.username}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD}`);
    console.log(`👤 Role: ${admin.role}`);
    console.log(`\n⚠️  Store these credentials securely!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
