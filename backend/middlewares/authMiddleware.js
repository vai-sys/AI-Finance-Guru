// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set in env');
}

const auth = async (req, res, next) => {
  try {
 
    const token = req.cookies && req.cookies.authToken;
 
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

  
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isDisabled) {
      return res.status(403).json({ message: 'Account disabled' });
    }

   
    if (user.passwordChangedAt) {
      const passwordChangedAtSec = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      if (payload.iat && payload.iat < passwordChangedAtSec) {
        return res.status(401).json({ message: 'Token invalid due to password change. Please login again.' });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { auth };
