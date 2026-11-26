// Travel Guardian - Simple Express REST API Backend Server
// Uses: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, multer, cors, dotenv

const express = require('express');
// console.log(express);
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file first
dotenv.config();

// Connect to MongoDB Atlas / local MongoDB
const connectDB = require('./config/db');
connectDB();

// Initialize Express App
const app = express();

// -----------------------------------------------
// Global Middleware
// -----------------------------------------------

// Allow cross-origin requests from React Native app
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data (for simple forms)
app.use(express.urlencoded({ extended: true }));

// Simple request logger for debugging frontend -> backend calls
app.use((req, res, next) => {
  console.log(`[Express API] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static uploaded files (photos, scanned docs, evidence videos)
// Access uploaded files at: http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -----------------------------------------------
// Health Check Routes
// -----------------------------------------------

// Root info route
app.get('/', (req, res) => {
  res.json({
    message: '🛡️ Travel Guardian API is running!',
    version: '1.0.0',
    status: 'OK',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      trips: '/api/trips',
      contacts: '/api/contacts',
      locations: '/api/location',
      media: '/api/media',
      documents: '/api/documents',
    },
  });
});

// Dedicated health check endpoint for React Native app connection testing
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Travel Guardian API is running',
  });
});

// -----------------------------------------------
// API Routes
// -----------------------------------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));

// -----------------------------------------------
// Error Handling Middleware (must come LAST)
// -----------------------------------------------
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

// -----------------------------------------------
// Helper to detect local network IPv4 address
// -----------------------------------------------
const os = require('os');
const getLocalIP = () => {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (err) {
    // Fallback
  }
  return '192.168.0.5';
};

// -----------------------------------------------
// Start Listening (0.0.0.0 binds to all network interfaces for mobile testing)
// -----------------------------------------------
const PORT = process.env.PORT || 5000;
const localIP = getLocalIP();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Travel Guardian Server is running!`);
  console.log(`   • Localhost:  http://localhost:${PORT}`);
  console.log(`   • Network IP: http://${localIP}:${PORT}`);
  console.log(`   • Health:     http://${localIP}:${PORT}/api/health`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB URI: ${process.env.MONGO_URI ? 'Configured' : 'Using default local URI'}\n`);
});

