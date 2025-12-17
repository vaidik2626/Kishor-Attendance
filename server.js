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

const app = express();

// CORS middleware should be at the top, before any other middleware or routes
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
