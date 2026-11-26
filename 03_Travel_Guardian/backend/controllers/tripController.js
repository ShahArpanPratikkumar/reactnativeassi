// ============================================================
// Trip Controller - Full CRUD for Travel Plans
// All trips are private — only the owner can access them
// ============================================================
const Trip = require('../models/Trip');

// ============================================================
// @desc    Get all trips for the logged-in user
// @route   GET /api/trips
// @access  Private
// ============================================================
const getTrips = async (req, res) => {
  try {
    // Only fetch trips that belong to the logged-in user
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error('getTrips error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Get a single trip by ID
// @route   GET /api/trips/:id
// @access  Private
// ============================================================
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    // Check if trip exists
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Check that this trip belongs to the logged-in user
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this trip' });
    }

    res.json({ success: true, data: trip });
  } catch (error) {
    console.error('getTripById error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
// ============================================================
const createTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, hotel, notes, status, vehicleType } = req.body;

    // --- Validation ---
    if (!title || !destination || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide trip title, destination, and start date',
      });
    }

    const trip = await Trip.create({
      user:        req.user._id,
      title:       title.trim(),
      destination: destination.trim(),
      startDate,
      endDate:     endDate || '',
      hotel:       hotel   || '',
      notes:       notes   || '',
      status:      status  || 'Upcoming',
      vehicleType: vehicleType || 'Car',
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully!',
      data: trip,
    });
  } catch (error) {
    console.error('createTrip error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Update an existing trip
// @route   PUT /api/trips/:id
// @access  Private
// ============================================================
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Only the owner can edit
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this trip' });
    }

    const updated = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Trip updated successfully!',
      data: updated,
    });
  } catch (error) {
    console.error('updateTrip error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
// ============================================================
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Only the owner can delete
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this trip' });
    }

    await trip.deleteOne();

    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('deleteTrip error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip };
