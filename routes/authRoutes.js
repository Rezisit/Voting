const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const VoterCode = require("../models/VoterCode");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =======================
// REGISTER (ADMIN / USERS)
// =======================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      votedPositions: [],
    });

    res.json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// =======================
// LOGIN (ADMIN)
// =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed",
    });
  }
});

// =======================
// LOGIN USING VOTER CODE
// =======================
router.post("/login-code", async (req, res) => {
  try {
    let { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Voter code required",
      });
    }

    code = code.trim().toUpperCase();

    const voterCode = await VoterCode.findOne({ code });

    if (!voterCode) {
      return res.status(400).json({
        message: "Code not found in system",
      });
    }

    if (voterCode.used) {
      return res.status(400).json({
        message: "This code has already been used",
      });
    }

    const token = jwt.sign(
      {
        role: "voter",
        code: voterCode.code,
      },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.json({
      message: "Voter login successful",
      token,
      role: "voter",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Code login failed",
    });
  }
});

// =======================
// GET USER VOTED POSITIONS
// =======================
router.get("/votes", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user.votedPositions || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch voted positions",
    });
  }
});

module.exports = router;