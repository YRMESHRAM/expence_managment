const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const reportRoutes = require('./routes/reportRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Initialize app
const app = express();

// Connect to Database
connectDB();

// Security and utility middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdnjs.cloudflare.com',
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'https://cdnjs.cloudflare.com',
        ],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files (built dist or public)
const fs = require('fs');
const distPath = path.join(__dirname, '../frontend/dist');
const frontendPath = fs.existsSync(distPath) ? distPath : path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// 404 handler for unknown API routes
app.use('/api/*', notFound);

// SPA fallback: any page request not caught by static middleware goes to index.html
app.get('*', (req, res) => {
  const indexPath = fs.existsSync(path.join(frontendPath, 'index.html'))
    ? path.join(frontendPath, 'index.html')
    : path.join(__dirname, '../frontend/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: 'FinTrack API is running. Vite dev server runs at http://localhost:5173' });
  }
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` FinTrack Expense Management System`);
  console.log(` Server URL : http://localhost:${PORT}`);
  console.log(` Mode       : ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n🚨 Port ${PORT} is already in use by another process.`);
    console.error(`Options:`);
    console.error(`1. Close the terminal/process occupying port ${PORT}`);
    console.error(`2. Or change PORT in backend/.env (e.g., PORT=5001)\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

module.exports = app;
