const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// =========================
// 📩 SUBMIT FEEDBACK (VOTER)
// =========================
router.post("/", protect, async (req, res) => {
  try {
    const { message, rating } = req.body;

    // ❌ Removed the vote-first check

    // Prevent duplicate feedback
    const existing = await Feedback.findOne({
      $or: [
        { user: req.user._id },
        { voter: req.user._id }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: "You already submitted feedback" });
    }

    const feedbackData = { message, rating };

    // Assign correct owner
    if (req.user.role === "voter") {
      feedbackData.voter = req.user._id;
    } else {
      feedbackData.user = req.user._id;
    }

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    res.status(201).json({ message: "Feedback submitted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving feedback" });
  }
});

// =========================
// 📊 GET ALL FEEDBACK (ADMIN)
// =========================
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name email")
      .populate("voter", "code")
      .sort({ createdAt: -1 });

    res.json(feedbacks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching feedback" });
  }
});

module.exports = router;