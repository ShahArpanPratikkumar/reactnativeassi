// Auth Routes
const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// -----------------------------------------------
// Public routes (no JWT required)
// -----------------------------------------------

// POST /api/auth/register  → Create new account
router.post('/register', register);

// POST /api/auth/login     → Login and receive JWT
router.post('/login', login);

// -----------------------------------------------
// Private routes (JWT required)
// -----------------------------------------------

// GET /api/auth/me         → Get currently logged-in user
router.get('/me', protect, getMe);

// PUT /api/auth/profile    → Update user profile
router.put('/profile', protect, updateProfile);

module.exports = router;
