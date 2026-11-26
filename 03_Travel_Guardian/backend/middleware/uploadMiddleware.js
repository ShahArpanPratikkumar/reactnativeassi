// ============================================================
// Multer File Upload Middleware
// Supports: Images (.jpg/.png/.webp), Videos (.mp4/.mov), Documents (.pdf)
// Saves uploaded files to: backend/uploads/
// ============================================================
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Make sure the uploads directory exists when the server starts
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// -------------------------------------------------------
// Storage Configuration: where and how to save the file
// -------------------------------------------------------
const storage = multer.diskStorage({
  // Save all files into backend/uploads/
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  // Generate a unique filename: fieldname-timestamp-randomNumber.ext
  // Example: file-1725078543234-812345678.jpg
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// -------------------------------------------------------
// File Type Filter: Only allow images, videos, and PDFs
// -------------------------------------------------------
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    // Videos
    'video/mp4',
    'video/quicktime',  // .mov from iPhone
    'video/mpeg',
    'video/webm',
    // Documents
    'application/pdf',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    // Reject file with a clear error message
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only images (JPEG, PNG, WebP), videos (MP4, MOV), and PDF documents are allowed.`
      ),
      false
    );
  }
};

// -------------------------------------------------------
// Final multer instance with limits
// -------------------------------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max per file
    files: 1,                    // Only 1 file per request
  },
});

module.exports = upload;
