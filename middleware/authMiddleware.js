const jwt = require("jsonwebtoken");
const User = require("../models/User");
const VoterCode = require("../models/VoterCode");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ======================
    // ADMIN / USER LOGIN
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
    // VOTER CODE LOGIN
    // ======================
    const voterCode = decoded.code || decoded.voterCode;

    if (!voterCode) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const voter = await VoterCode.findOne({ code: voterCode });

    if (!voter) {
      return res.status(401).json({ message: "Invalid voter code" });
    }

    req.user = {
      code: voter.code,
      role: "voter",
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = { protect };