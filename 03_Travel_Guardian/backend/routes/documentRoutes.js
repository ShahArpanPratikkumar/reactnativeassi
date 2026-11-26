// Document Routes - with multer multipart/form-data upload support
const express  = require('express');
const router   = express.Router();
const { getDocuments, uploadDocument, deleteDocument, updateDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload   = require('../middleware/uploadMiddleware');

// GET  /api/documents  → Get all vault documents
// POST /api/documents  → Upload a new scanned document (multipart/form-data, field name: 'file')
router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('file'), uploadDocument);

// PUT    /api/documents/:id  → Update document (rename, favorite, expiry)
// DELETE /api/documents/:id  → Remove a document
router.route('/:id')
  .put(protect, updateDocument)
  .delete(protect, deleteDocument);

module.exports = router;
