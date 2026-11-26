// Media Routes - with multer multipart/form-data upload support
const express  = require('express');
const router   = express.Router();
const { getMedia, uploadMedia, deleteMedia } = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');
const upload   = require('../middleware/uploadMiddleware');

// GET  /api/media      → Get all evidence media
// POST /api/media      → Upload new photo/video (multipart/form-data, field name: 'file')
router.route('/')
  .get(protect, getMedia)
  .post(protect, upload.single('file'), uploadMedia);

// DELETE /api/media/:id  → Delete a media item
router.delete('/:id', protect, deleteMedia);

module.exports = router;
