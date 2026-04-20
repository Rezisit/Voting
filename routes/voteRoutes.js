const express = require('express');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const VoterCode = require('../models/Votercode');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ======================
// TEST ROUTE
// ======================
router.get('/test', (req, res) => {
  res.send("Vote route is working ✅");
});

// ======================
// CAST MULTIPLE VOTES
// ======================
router.post('votes/batch', protect, async (req, res) => {
  let { candidateIds } = req.body;

  if (!candidateIds || candidateIds.length === 0) {
    return res.status(400).json({ message: 'No candidates selected' });
  }

  if (!Array.isArray(candidateIds)) candidateIds = [candidateIds];

  try {
    const results = [];
    const skipped = [];

    await Promise.all(candidateIds.map(async (id) => {
      const candidate = await Candidate.findById(id);
      if (!candidate) {
        skipped.push(`Candidate not found: ${id}`);
        return;
      }

      const position = candidate.candidacy;

      const alreadyVoted = await Vote.findOne({
        user: req.user._id,
        userType: req.user.role === 'voter' ? 'VoterCode' : 'User',
        position
      });

      if (alreadyVoted) {
        skipped.push(`Already voted for ${position}`);
        return;
      }

      await Vote.create({
        user: req.user._id,
        userType: req.user.role === 'voter' ? 'VoterCode' : 'User',
        candidate: candidate._id,
        position
      });

      await Candidate.findByIdAndUpdate(candidate._id, {
        $inc: { votes: 1 }
      });

      results.push(position);
    }));

    if (results.length === 0) {
      return res.status(400).json({
        message: "Vote failed",
        skipped
      });
    }

    if (req.user.role === 'voter') {
      await VoterCode.findByIdAndUpdate(req.user._id, {
        used: true,
        usedAt: new Date()
      });
    }

    res.json({
      message: "Votes submitted successfully",
      votedPositions: results,
      skippedPositions: skipped
    });

  } catch (error) {
    console.error("Batch Vote Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ======================
// GET USER VOTES (FIXED)
// ======================
router.get('/votes', protect, async (req, res) => {
  try {
    const votes = await Vote.find({
      user: req.user._id,
      userType: req.user.role === 'voter' ? 'VoterCode' : 'User'
    }).populate('candidate');

    console.log("Fetched Votes:", votes);

    const formatted = votes.map(v => ({
      candidateId: v.candidate?._id || null,
      candidateName: v.candidate
        ? `${v.candidate.firstName} ${v.candidate.lastName}`
        : "Deleted Candidate",
      position: v.position || "Unknown Position",
      image: v.candidate?.image || null
    }));

    res.json(formatted);

  } catch (err) {
    console.error("Error fetching votes:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;