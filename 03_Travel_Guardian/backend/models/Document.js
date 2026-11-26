// Document Model - Stores scanned travel documents in the offline vault

const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    documentType: {
      type: String,
      default: 'Passport',
      trim: true,
    },
    // URL to the scanned image file
    fileUrl: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
      default: '',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', DocumentSchema);
