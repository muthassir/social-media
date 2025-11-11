const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

// Middleware to verify JWT token and protect routes
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization');

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied'
      });
    }

    // Remove 'Bearer ' from token if present
    const actualToken = token.replace('Bearer ', '');

    // Verify the token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    
    // Find user by ID from token and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists'
      });
    }

    // Attach user ID to request for use in controllers
    req.userId = user._id;
    req.user = user;
    
    // Move to next middleware or route handler
    next();

  } catch (error) {
    console.log('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = authMiddleware;