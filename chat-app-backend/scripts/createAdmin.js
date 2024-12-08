// backend/scripts/createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AdminProfile = require('../models/AdminProfile');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Function to create a new admin account.
 */
const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const username = 'admin2'; // Replace with desired username
    const email = 'admin2@gmail.com'; // Replace with desired email
    const password = '123'; // Replace with desired password

    // Check if admin already exists
    const existingAdmin = await AdminProfile.findOne({ email });
    if (existingAdmin) {
      console.log('Admin with this email already exists.');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const newAdmin = await AdminProfile.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log('Admin created successfully:', newAdmin);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  }
};

// Execute the function
createAdmin();
