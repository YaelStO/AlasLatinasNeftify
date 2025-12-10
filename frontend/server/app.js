const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Mock database similar to production
const db = require('./utils/database');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

// Create app for testing
function createApp() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  // Auth routes
  app.use('/api/auth', authRoutes);
  
  // Protected routes example
  app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is protected', user: req.user });
  });
  
  return app;
}

module.exports = createApp;
