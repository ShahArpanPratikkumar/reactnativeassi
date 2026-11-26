// ============================================================
// Media Controller
// Upload and manage safety evidence photos & videos
// Uses multer for multipart/form-data file handling
// ============================================================
const Media = require('../models/Media');

// ============================================================
// @desc    Get all media evidence for the logged-in user
// @route   GET /api/media
// @access  Private
// ============================================================
const getMedia = async (req, res) => {
  try {
    const media = await Media.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: media.length,
      data: media,
    });
  } catch (error) {
    console.error('getMedia error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Upload a new photo or video evidence file
// @route   POST /api/media
// @access  Private
// Note: multer upload.single('file') middleware is applied in mediaRoutes.js
// ============================================================
const uploadMedia = async (req, res) => {
  try {
    const { title, mediaType, location } = req.body;

    // --- Validation ---
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title for the evidence',
      });
    }

    // Build the file URL
    // If a file was uploaded via multipart/form-data → use its server path
    // If a fileUrl string was sent in the body → use that (for testing)
    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a photo or video.',
      });
    }

    const media = await Media.create({
      user:      req.user._id,
      title:     title.trim(),
      fileUrl,
      mediaType: mediaType || 'photo',
      location:  location  || '',
    });

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully!',
      data: media,
    });
  } catch (error) {
    console.error('uploadMedia error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Delete a media evidence item
// @route   DELETE /api/media/:id
// @access  Private
// ============================================================
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    // Ownership check
    if (media.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await media.deleteOne();

    res.json({ success: true, message: 'Evidence deleted successfully' });
  } catch (error) {
    console.error('deleteMedia error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { getMedia, uploadMedia, deleteMedia };
