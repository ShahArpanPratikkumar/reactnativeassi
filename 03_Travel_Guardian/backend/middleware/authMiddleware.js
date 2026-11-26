// ============================================================
// JWT Authentication Middleware
// Protects private routes — must have valid Bearer token
// ============================================================
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Usage: add `protect` as middleware before any private route handler
// Example: router.get('/profile', protect, getProfile)
const protect = async (req, res, next) => {
  let token;

  // Step 1: Check if Authorization header exists and starts with "Bearer"
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]; // Extract the token after "Bearer "
  }

  // Step 2: If no token found, reject the request
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login to continue.',
    });
  }

  // Step 3: Verify the token is valid and not expired
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'travel_guardian_secret_key_2026'
    );

    // Step 4: Load the user from database using the ID stored in the token
    // We exclude the password field for security
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found. Please register again.',
      });
    }

    // Step 5: Attach user to the request so controllers can use it
    req.user = user;
    next(); // Continue to the actual route handler

  } catch (error) {
    // Token was tampered with or has expired
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
};

module.exports = { protect };
