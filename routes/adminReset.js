const express = require("express");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const VoterCode = require("../models/VoterCode");

const router = express.Router();

// ======================
// RESET ELECTION
// ======================
router.post("/reset-election", async (req, res) => {
  try {
    // delete all votes
    await Vote.deleteMany({});

    // reset candidate votes
    await Candidate.updateMany({}, { $set: { votes: 0 } });

    // reset voter codes
    await VoterCode.updateMany(
      {},
      {
        $set: {
          used: false,
          usedAt: null,
        },
      }
    );

    res.json({
      message: "Election reset successfully",
    });

  } catch (error) {
    console.error("Reset Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;