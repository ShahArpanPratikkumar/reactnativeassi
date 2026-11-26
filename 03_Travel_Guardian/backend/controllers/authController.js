// ============================================================
// Auth Controller
// Handles: Register, Login, Get current user (me), Update profile
// ============================================================
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');

// -------------------------------------------------------
// Helper: create a signed JWT token for a given user ID
// -------------------------------------------------------
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'travel_guardian_secret_key_2026',
    { expiresIn: '30d' }
  );
};

// -------------------------------------------------------
// Helper: return a safe user object (NO password field)
// -------------------------------------------------------
const safeUser = (user) => ({
  id:             user._id,
  name:           user.name,
  email:          user.email,
  phone:          user.phone,
  bloodGroup:     user.bloodGroup,
  allergies:      user.allergies,
  emergencyNotes: user.emergencyNotes,
  createdAt:      user.createdAt,
});

// ============================================================
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ============================================================
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // --- Basic validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // --- Check for duplicate email ---
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.',
      });
    }

    // --- Create user (password is hashed by User model pre-save hook) ---
    const user = await User.create({
      name:  name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Login an existing user
// @route   POST /api/auth/login
// @access  Public
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Basic validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // --- Find user by email ---
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // --- Compare entered password with stored hash ---
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Get currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private (requires JWT)
// ============================================================
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: safeUser(user),
    });

  } catch (error) {
    console.error('getMe error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Update user profile (name, phone, medical info)
// @route   PUT /api/auth/profile
// @access  Private
// ============================================================
const updateProfile = async (req, res) => {
  try {
    const { name, phone, bloodGroup, allergies, emergencyNotes } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only update fields that were actually sent in the request
    if (name)           user.name           = name.trim();
    if (phone !== undefined)          user.phone          = phone;
    if (bloodGroup !== undefined)     user.bloodGroup     = bloodGroup;
    if (allergies !== undefined)      user.allergies      = allergies;
    if (emergencyNotes !== undefined) user.emergencyNotes = emergencyNotes;

    const updated = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: safeUser(updated),
    });

  } catch (error) {
    console.error('updateProfile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
