// routes/codeRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // your auth middleware
const Code = require("../models/Code"); // mongoose model for codes

// GET all voter codes — available to any authenticated user
router.get("/", protect, async (req, res) => {
  try {
    const codes = await Code.find().sort({ createdAt: -1 }); // latest first
    res.json(codes);
  } catch (error) {
    console.error("Error fetching codes:", error);
    res.status(500).json({ message: "Server error fetching codes" });
  }
});

// POST generate codes — only admins can create new codes
router.post("/generate", protect, async (req, res) => {
  // check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can generate codes" });
  }

  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  try {
    const newCodes = [];

    for (let i = 0; i < amount; i++) {
      const code = new Code({
        code: Math.random().toString(36).substring(2, 10).toUpperCase(), // simple random code
        used: false,
        voted: false,
      });
      await code.save();
      newCodes.push(code);
    }

    res.status(201).json(newCodes);
  } catch (error) {
    console.error("Error generating codes:", error);
    res.status(500).json({ message: "Server error generating codes" });
  }
});

module.exports = router;