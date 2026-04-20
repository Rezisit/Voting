const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Middleware to verify logged-in user
const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to verify admin user
const verifyAdmin = async (req, res, next) => {
  try {
    await verifyUser(req, res, async () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
      next();
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports = { verifyUser, verifyAdmin };
