require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const sabhaRoutes = require('./routes/sabhaRoutes');
const authRoutes = require('./routes/authRoutes');
const saintRoutes = require('./routes/saintRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_db');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', sabhaRoutes);
app.use('/api', saintRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Attendance Backend API',
    version: '1.0.0',
    endpoints: {
      // Auth endpoints
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      getProfile: 'GET /api/auth/profile',
      
      // User endpoints
      createUser: 'POST /api/users',
      getAllUsers: 'GET /api/users',
      getUserById: 'GET /api/users/:id',
      updateUser: 'PUT /api/users/:id',
      deleteUser: 'DELETE /api/users/:id',
      
      // Sabha endpoints
      createSabha: 'POST /api/sabhas',
      getAllSabhas: 'GET /api/sabhas',
      getSabhaById: 'GET /api/sabhas/:id',
      updateSabha: 'PUT /api/sabhas/:id',
      deleteSabha: 'DELETE /api/sabhas/:id',
      
      // Attendance endpoints
      markAttendance: 'POST /api/sabhas/:sabhaId/attendance',
      markBulkAttendance: 'POST /api/sabhas/:sabhaId/attendance/bulk',
      getSabhaAttendanceReport: 'GET /api/sabhas/:sabhaId/attendance/report',
      getUserAttendanceHistory: 'GET /api/users/:userId/attendance/history'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
