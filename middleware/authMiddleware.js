const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { Member } = require('../models/Member');

function getBearerToken(req) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
}

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

      // Get admin from token
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, admin not found'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Hard-requires a valid Poshak Leader token. Used on every /api/leader/* route.
const protectLeader = async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    if (decoded.role !== 'POSHAK_LEADER') {
      return res.status(403).json({ success: false, message: 'Not authorized for this resource' });
    }

    req.leader = await Member.findById(decoded.id).select('-password');
    if (!req.leader || req.leader.role !== 'POSHAK_LEADER') {
      return res.status(401).json({ success: false, message: 'Not authorized, leader not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Optional/non-blocking: decodes a token if present and attaches req.admin or
// req.leader, but always calls next() — even with no or an invalid token.
// Lets existing (currently unauthenticated) admin routes add ownership checks
// for leader callers without breaking today's no-login admin usage.
const identify = async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    if (decoded.role === 'POSHAK_LEADER') {
      req.leader = await Member.findById(decoded.id).select('-password');
    } else {
      req.admin = await Admin.findById(decoded.id).select('-password');
    }
  } catch (error) {
    // Invalid/expired token on an otherwise-open route — proceed unauthenticated
    // rather than rejecting, to match this route's existing behavior.
  }

  next();
};

module.exports = { protect, protectLeader, identify };
