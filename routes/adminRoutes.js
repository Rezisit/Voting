const express = require("express");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");
const VoterCode = require("../models/VoterCode");
const Election = require("../models/Election");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =======================
// ADMIN ONLY MIDDLEWARE
// =======================
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role?.toLowerCase() === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
};

// =======================
// GENERATE VOTER CODES
// =======================
router.post("/codes/generate", protect, adminOnly, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount required" });
    }

    const codes = [];

    for (let i = 0; i < amount; i++) {
      const code = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      codes.push({
        code,
        used: false,
        voted: false,
      });
    }

    const createdCodes = await VoterCode.insertMany(codes);

    res.json({
      message: `${amount} voter codes generated`,
      codes: createdCodes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate codes" });
  }
});

// =======================
// GET ALL VOTER CODES
// =======================
router.get("/codes", protect, adminOnly, async (req, res) => {
  try {
    const codes = await VoterCode.find().sort({ createdAt: -1 });
    res.json(codes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch voter codes" });
  }
});

// =======================
// DELETE VOTER CODE
// =======================
router.delete("/codes/:id", protect, adminOnly, async (req, res) => {
  try {
    const code = await VoterCode.findById(req.params.id);

    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    await code.deleteOne();

    res.json({ message: "Voter code deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete code" });
  }
});

// =======================
// 🔥 FIXED RESET ELECTION (IMPORTANT)
// =======================
router.post("/reset-election", protect, adminOnly, async (req, res) => {
  try {
    // remove all votes
    await Vote.deleteMany({});

    // reset voter codes
    await VoterCode.deleteMany({});

    // reset candidate votes (CRITICAL FIX)
    await Candidate.updateMany({}, { votes: 0 });

    // reset election status (safe default)
    await Election.updateMany({}, { isOpen: true });

    res.json({ message: "Election reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset election" });
  }
});

// =======================
// RESULTS
// =======================
router.get("/results", protect, adminOnly, async (req, res) => {
  try {
    const candidates = await Candidate.find();

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const voteCount = await Vote.countDocuments({
          candidateId: candidate._id,
        });

        return {
          ...candidate.toObject(),
          votes: voteCount,
        };
      })
    );

    res.json(results.sort((a, b) => b.votes - a.votes));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

// =======================
// STATS
// =======================
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalVoterCodes = await VoterCode.countDocuments();

    // IMPORTANT: make sure this matches your schema (voted vs used)
    const usedCodes = await VoterCode.countDocuments({ voted: true });

    const totalVotes = await Vote.countDocuments();

    const turnout =
      totalVoterCodes === 0
        ? 0
        : Math.round((usedCodes / totalVoterCodes) * 100);

    res.json({
      totalVoterCodes,
      usedCodes,
      totalVotes,
      turnout,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin statistics" });
  }
});

// =======================
// ELECTION STATUS
// =======================
router.get("/election/status", async (req, res) => {
  try {
    let election = await Election.findOne();

    if (!election) {
      election = await Election.create({ isOpen: true });
    }

    res.json({ isOpen: election.isOpen });
  } catch (error) {
    res.status(500).json({ message: "Failed to get election status" });
  }
});

// =======================
// CLOSE ELECTION
// =======================
router.put("/election/close", protect, adminOnly, async (req, res) => {
  try {
    let election = await Election.findOne();

    if (!election) election = new Election({ isOpen: false });
    else election.isOpen = false;

    await election.save();

    res.json({ message: "Election closed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to close election" });
  }
});

// =======================
// OPEN ELECTION
// =======================
router.put("/election/open", protect, adminOnly, async (req, res) => {
  try {
    let election = await Election.findOne();

    if (!election) election = new Election({ isOpen: true });
    else election.isOpen = true;

    await election.save();

    res.json({ message: "Election opened successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to open election" });
  }
});

module.exports = router;