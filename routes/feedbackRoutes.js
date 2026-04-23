const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const { protect } = require("../middleware/authMiddleware");

// ======================
// SUBMIT FEEDBACK
// ======================
router.post("/", protect, async (req, res) => {
  try {
    const { message, rating } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    // Prevent duplicate feedback per voter
    const existing = await Feedback.findOne({
      voterCode: req.user.code,
    });

    if (existing) {
      return res.status(400).json({
        message: "You already submitted feedback",
      });
    }

    const feedback = await Feedback.create({
      voterCode: req.user.code,
      message,
      rating,
    });

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (err) {
    console.error("Feedback Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ======================
// GET ALL FEEDBACK (TEMP: PUBLIC OR ADMIN VIEW)
// ======================
router.get("/", protect, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching feedback" });
  }
});

module.exports = router;