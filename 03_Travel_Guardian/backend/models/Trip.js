// Trip Model - Stores travel itinerary details

const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema(
  {
    // Which user this trip belongs to
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String,
      default: '',
    },
    hotel: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed'],
      default: 'Upcoming',
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'Bus', 'Train', 'Flight', 'Taxi', 'Walking', 'Bicycle', 'Auto Rickshaw', 'Other'],
      default: 'Car',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', TripSchema);
