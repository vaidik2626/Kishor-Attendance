require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const memberRoutes = require("./routes/memberRoutes");
const sabhaRoutes = require('./routes/sabhaRoutes');
const authRoutes = require('./routes/authRoutes');
const saintRoutes = require('./routes/saintRoutes');
const sevaRoutes = require('./routes/sevaRoutes');
const eventResponseRoutes = require('./routes/eventResponseRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL
];

// CORS middleware should be at the top, before any other middleware or routes
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, server calls
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/members", memberRoutes);
app.use('/api/sabhas', sabhaRoutes);
app.use('/api', sevaRoutes);
app.use('/api', saintRoutes);
app.use('/api/event-response', eventResponseRoutes);


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
