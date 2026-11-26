// ============================================================
// Document Controller
// Upload and manage scanned travel documents
// Uses multer for multipart/form-data file handling
// ============================================================
const Document = require('../models/Document');

// ============================================================
// @desc    Get all documents in the user's vault
// @route   GET /api/documents
// @access  Private
// ============================================================
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error('getDocuments error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Upload a scanned travel document image
// @route   POST /api/documents
// @access  Private
// Note: multer upload.single('file') middleware is applied in documentRoutes.js
// ============================================================
const uploadDocument = async (req, res) => {
  try {
    const { title, documentType, expiryDate } = req.body;

    // --- Validation ---
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title for the document',
      });
    }

    // Build file URL from multer upload or body
    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No document image uploaded. Please scan or select a file.',
      });
    }

    const document = await Document.create({
      user:         req.user._id,
      title:        title.trim(),
      documentType: documentType || 'Passport',
      fileUrl,
      expiryDate:   expiryDate   || '',
    });

    res.status(201).json({
      success: true,
      message: 'Document saved to vault!',
      data: document,
    });
  } catch (error) {
    console.error('uploadDocument error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Delete a document from the vault
// @route   DELETE /api/documents/:id
// @access  Private
// ============================================================
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Ownership check
    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
    }

    await document.deleteOne();

    res.json({ success: true, message: 'Document removed from vault' });
  } catch (error) {
    console.error('deleteDocument error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Update a document (Rename title, favorite, or metadata)
// @route   PUT /api/documents/:id
// @access  Private
// ============================================================
const updateDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Ownership check
    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this document' });
    }

    const { title, documentType, expiryDate, isFavorite } = req.body;

    if (title !== undefined) {
      document.title = title.trim();
    }
    if (documentType !== undefined) {
      document.documentType = documentType;
    }
    if (expiryDate !== undefined) {
      document.expiryDate = expiryDate;
    }
    if (isFavorite !== undefined) {
      document.isFavorite = Boolean(isFavorite);
    }

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document,
    });
  } catch (error) {
    console.error('updateDocument error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { getDocuments, uploadDocument, deleteDocument, updateDocument };
