// Location Routes
const express  = require('express');
const router   = express.Router();
const { getLocations, saveLocation } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

// GET  /api/location  → Get GPS history
// POST /api/location  → Save new location / SOS beacon
router.route('/')
  .get(protect, getLocations)
  .post(protect, saveLocation);

module.exports = router;
