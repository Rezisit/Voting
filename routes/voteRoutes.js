const express = require("express");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const VoterCode = require("../models/Votercode");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ======================
// TEST
// ======================
router.get("/test", (req, res) => {
  res.json({ message: "Vote route working ✅" });
});

// ======================
// CAST VOTE
// ======================
router.post("/batch", protect, async (req, res) => {
  const { votes } = req.body;

  if (!votes || votes.length === 0) {
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

      // increment vote count
      await Candidate.findByIdAndUpdate(candidate._id, {
        $inc: { votes: 1 }
      });

      results.push(position);
    }

    await VoterCode.updateOne(
      { code: voterCode },
      { used: true, usedAt: new Date() }
    );

    res.json({
      message: "Vote successful ✅",
      votedPositions: results,
    });

  } catch (err) {
    console.error("Vote Error:", err);
    res.status(500).json({ message: err.message });
  }
});


// ======================
// 🔥 GET MY VOTES (MAIN FIX)
// ======================
router.get("/", protect, async (req, res) => {
  try {
    const voterCode = req.user.code;

    if (!voterCode) {
      return res.status(400).json({ message: "No voter code found" });
    }

    const votes = await Vote.find({ voterCode })
      .populate("candidate");

    const formatted = votes.map(v => ({
      position: v.position,
      candidateId: v.candidate?._id,
      candidateName: v.candidate
        ? `${v.candidate.firstName} ${v.candidate.lastName}`
        : "Unknown",
      image: v.candidate?.image || null
    }));

    res.json(formatted);

  } catch (err) {
    console.error("GET VOTES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ======================
// 🔥 MY VOTES (RECEIPT)
// ======================
router.get("/my-votes", protect, async (req, res) => {
  try {
    const voterCode = req.user.code;

    const votes = await Vote.find({ voterCode })
      .populate("candidate");

    if (!votes.length) {
      return res.json({
        message: "No votes found",
        votes: []
      });
    }

    // format for receipt
    const formatted = votes.map(v => ({
      position: v.position,
      candidateId: v.candidate?._id,
      candidateName: v.candidate
        ? `${v.candidate.firstName} ${v.candidate.lastName}`
        : "Unknown",
      partylist: v.candidate?.partylist || "N/A",
      image: v.candidate?.image || null
    }));

    // 🔥 SORT by position (important for receipt)
    formatted.sort((a, b) => a.position.localeCompare(b.position));

    res.json({
      message: "Voting receipt fetched ✅",
      totalVotes: formatted.length,
      data: formatted
    });

  } catch (err) {
    console.error("My Votes Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;