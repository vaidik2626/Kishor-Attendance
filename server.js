require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const memberRoutes = require("./routes/memberRoutes");
const sabhaRoutes = require('./routes/sabhaRoutes');
const authRoutes = require('./routes/authRoutes');
const saintRoutes = require('./routes/saintRoutes');
const sevaRoutes = require('./routes/sevaRoutes');
const eventResponseRoutes = require('./routes/eventResponseRoutes');
const leaderRoutes = require('./routes/leaderRoutes');

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

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

// Flags misconfigured Cloudinary credentials at boot rather than letting
// every photo-upload request fail with an opaque error later — a very easy
// thing to forget to set in the deploy platform's env vars (a local .env
// file is never read in production there).
['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].forEach((key) => {
  if (!process.env[key]) {
    console.error(`[startup] Missing env var ${key} — photo uploads (create/edit member) will fail until this is set.`);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/members", memberRoutes);
app.use('/api/sabhas', sabhaRoutes);
app.use('/api', sevaRoutes);
app.use('/api', saintRoutes);
app.use('/api/event-response', eventResponseRoutes);
app.use('/api/leader', leaderRoutes);

// Catches anything a route/middleware throws or forwards via next(err) that
// isn't already handled (e.g. multer/Cloudinary upload failures, which
// happen before a route handler's own try/catch even runs) — without this,
// Express's default handler sends a bare, contentless 500 with no way to
// tell what actually broke, in server logs or in the response.
app.use((err, req, res, next) => {
  console.error('[unhandled error]', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
