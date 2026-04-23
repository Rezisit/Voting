const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const VoterCode = require("../models/VoterCode");

// ===============================
// GET ALL VOTER CODES
// ===============================
router.get("/", protect, async (req, res) => {
  try {
    // optional admin check (recommended)
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const codes = await VoterCode.find().sort({ createdAt: -1 });
    res.json(codes);
  } catch (error) {
    console.error("Error fetching codes:", error);
    res.status(500).json({ message: "Server error fetching codes" });
  }
});

// ===============================
// GENERATE VOTER CODES
// ===============================
router.post("/generate", protect, async (req, res) => {
  try {
    // ADMIN CHECK
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can generate codes" });
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    const newCodes = [];

    for (let i = 0; i < amount; i++) {
      newCodes.push({
        code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        used: false,
        userId: null,
        usedAt: null,
      });
    }

    const inserted = await VoterCode.insertMany(newCodes);

    res.status(201).json({
      message: "Voter codes generated successfully",
      data: inserted,
    });

  } catch (error) {
    console.error("Error generating codes:", error);
    res.status(500).json({ message: "Server error generating codes" });
  }
});

module.exports = router;