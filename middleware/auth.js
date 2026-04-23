const jwt = require("jsonwebtoken");
const User = require("../models/User");
const VoterCode = require("../models/VoterCode");

// ======================
// AUTH (ADMIN + VOTER FIXED)
// ======================
const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ======================
    // ADMIN / NORMAL USER
    // ======================
    if (decoded.id) {
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = {
        _id: user._id,
        role: user.role,
      };

      return next();
    }

    // ======================
    // VOTER (CODE-BASED SYSTEM)
    // ======================
    if (decoded.role === "voter") {
      const voter = await VoterCode.findOne({ code: decoded.code });

      if (!voter) {
        return res.status(401).json({ message: "Invalid voter code" });
      }

      req.user = {
        _id: voter._id,
        role: "voter",
        code: voter.code, // 🔥 THIS FIXES EVERYTHING
      };

      return next();
    }

    return res.status(401).json({ message: "Invalid token" });

  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ======================
// ADMIN ONLY
// ======================
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Access denied. Admin only." });
};

module.exports = { verifyUser, verifyAdmin };