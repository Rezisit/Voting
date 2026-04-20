const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VoterCode = require('../models/Votercode');

// 🔐 PROTECT
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // =========================
    // ADMIN / REGISTERED USER
    // =========================
    if (decoded.id) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ message: 'User not found' });

      req.user = user;
      return next();
    }

    // =========================
    // VOTER
    // =========================
    if (decoded.voterId) {
      const voterCode = await VoterCode.findById(decoded.voterId);
      if (!voterCode) return res.status(401).json({ message: 'Invalid voter code' });

      req.user = {
        _id: voterCode._id,
        code: voterCode.code,
        role: 'voter',
        hasVoted: voterCode.hasVoted
      };

      return next();
    }

    return res.status(401).json({ message: 'Invalid token' });

  } catch (error) {
    console.error('Protect middleware error:', error);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

// 🔒 ADMIN ONLY
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin only" });
  }
};

module.exports = { protect, adminOnly };