const express = require("express");
const Vote = require("../models/Vote");
const VoterCode = require("../models/VoterCode");

const router = express.Router();

// ======================
// ELECTION STATISTICS
// ======================
router.get("/", async (req, res) => {
  try {
    const totalVoterCodes = await VoterCode.countDocuments();
    const usedCodes = await VoterCode.countDocuments({ used: true });
    const totalVotes = await Vote.countDocuments();

    const turnout =
      totalVoterCodes > 0
        ? Math.round((usedCodes / totalVoterCodes) * 100)
        : 0;

    res.json({
      totalVoterCodes,
      usedCodes,
      totalVotes,
      turnout,
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;