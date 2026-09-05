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

// Reset Password Route (for users who forgot their password)
router.post('/reset-password', async (req, res) => {
  try {
    const { mobile, newPassword } = req.body;
    if (!mobile || !newPassword) {
      return res.status(400).json({ message: 'Mobile number and new password are required.' });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: 'Mobile number not found.' });
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    await user.save();

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during password reset', error: err.message });
  }
});

// Update Profile Route
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;

    await user.save();

    res.json({ 
      message: 'Profile updated successfully', 
      user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role } 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Mobile number already in use by another account.' });
    }
    res.status(500).json({ message: 'Server error during profile update', error: err.message });
  }
});

module.exports = router;