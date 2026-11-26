// ============================================================
// Location Controller
// Saves GPS location history and SOS distress beacons
// ============================================================
const Location = require('../models/Location');

// ============================================================
// @desc    Get location history for logged-in user
// @route   GET /api/location
// @access  Private
// ============================================================
const getLocations = async (req, res) => {
  try {
    // Return up to the last 100 GPS records for this user, newest first
    const locations = await Location.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error('getLocations error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Save a new GPS location update or SOS distress beacon
// @route   POST /api/location
// @access  Private
// ============================================================
const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude, address, isSosTriggered } = req.body;

    // --- Validation ---
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude are required',
      });
    }

    const location = await Location.create({
      user:           req.user._id,
      latitude:       parseFloat(latitude),
      longitude:      parseFloat(longitude),
      address:        address        || '',
      isSosTriggered: isSosTriggered || false,
    });

    const message = isSosTriggered
      ? '🚨 SOS distress beacon saved! Emergency contacts will be alerted.'
      : 'Location saved successfully';

    res.status(201).json({
      success: true,
      message,
      data: location,
    });
  } catch (error) {
    console.error('saveLocation error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { getLocations, saveLocation };
