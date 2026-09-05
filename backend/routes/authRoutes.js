// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const adminConfig = require('../config/adminConfig');

// Seed default Admin User on startup with mobile and fixed password securely
async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminConfig.password, saltRounds);

      await User.create({
        name: adminConfig.name,
        mobile: adminConfig.mobile,
        password: hashedPassword,
        role: adminConfig.role
      });
      console.log(`Default admin user created successfully (Mobile: ${adminConfig.mobile}).`);
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
}
seedAdmin();

// Signup Route (for customers)
router.post('/signup', async (req, res) => {
  try {
    const { name, mobile, password } = req.body;
    if (!mobile || !password || !name) {
      return res.status(400).json({ message: 'Name, mobile number, and password are required.' });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: 'Mobile number already registered.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ name, mobile, password: hashedPassword, role: 'customer' });
    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// Login Route (Supports both Customer & Admin via mobile and password)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be mobile number
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Mobile number and password are required.' });
    }

    const user = await User.findOne({ $or: [{ mobile: identifier }, { name: identifier }] });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid mobile number or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid mobile number or password.' });
    }

    res.json({ message: 'Login successful', user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

module.exports = router;