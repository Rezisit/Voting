const express = require("express");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const VoterCode = require("../models/VoterCode");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ======================
// TEST
// ======================
router.get("/test", (req, res) => {
  res.send("Vote route working ✅");
});

// ======================
// CAST VOTE
// ======================
router.post("/batch", protect, async (req, res) => {
  const { votes } = req.body;

  if (!votes?.length) {
    return res.status(400).json({ message: "No votes submitted" });
  }

  try {
    const voterCode = req.user.code;

    const voter = await VoterCode.findOne({ code: voterCode });

    if (!voter) {
      return res.status(404).json({ message: "Invalid voter code" });
    }

    if (voter.used) {
      return res.status(400).json({ message: "Already voted" });
    }

    const results = [];

    for (const v of votes) {
      const { candidateId, position } = v;

      const candidate = await Candidate.findById(candidateId);
      if (!candidate) continue;

      const existing = await Vote.findOne({
        voterCode,
        position,
      });

      if (existing) continue;

      await Vote.create({
        voterCode,
        candidate: candidate._id,
        position,
      });

      results.push(position);
    }

    await VoterCode.updateOne(
      { code: voterCode },
      { used: true, usedAt: new Date() }
    );

    res.json({
      message: "Vote successful",
      votedPositions: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ======================
// GET BALLOT RECEIPT
// ======================
router.get("/", protect, async (req, res) => {
  try {
    const voterCode = req.user.code;

    const votes = await Vote.find({ voterCode }).populate(
      "candidate",
      "firstName lastName image candidacy"
    );

    const formatted = votes.map((v) => ({
      candidateId: v.candidate?._id,
      candidateName: v.candidate
        ? `${v.candidate.firstName} ${v.candidate.lastName}`
        : "Unknown",
      position: v.position,
      image: v.candidate?.image || null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;