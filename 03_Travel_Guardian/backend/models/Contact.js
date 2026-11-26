// Contact Model - Stores emergency contacts for SOS alerts

const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    relationship: {
      type: String,
      default: 'Emergency Contact',
    },
    isPrimary: {
      type: Boolean,
      default: false, // Primary contact is called first on SOS
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', ContactSchema);
