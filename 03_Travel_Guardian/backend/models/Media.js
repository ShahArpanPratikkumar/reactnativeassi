// Media Model - Stores safety evidence photos and video records

const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Media title is required'],
      trim: true,
    },
    // URL to the uploaded file (stored in /uploads/ or cloud)
    fileUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo',
    },
    location: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Media', MediaSchema);
