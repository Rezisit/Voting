const express = require("express");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/authMiddleware"); // adjust if separate

const router = express.Router();

router.get("/winner-by-position", protect, adminOnly, async (req, res) => {
  try {
    const results = await Vote.aggregate([
      // 1. Group by position + candidate
      {
        $group: {
          _id: {
            position: "$position",
            candidate: "$candidate"
          },
          totalVotes: { $sum: 1 }
        }
      },

      // 2. Sort highest votes first
      {
        $sort: { totalVotes: -1 }
      },

      // 3. Group again by position (pick top candidate per position)
      {
        $group: {
          _id: "$_id.position",
          winnerCandidate: { $first: "$_id.candidate" },
          votes: { $first: "$totalVotes" }
        }
      }
    ]);

    if (!results.length) {
      return res.status(404).json({ message: "No votes yet" });
    }

    // 4. Fetch candidate details
    const formatted = await Promise.all(
      results.map(async (r) => {
        const candidate = await Candidate.findById(r.winnerCandidate);

        return {
          position: r._id,
          winner: candidate
            ? candidate.name ||
              `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim()
            : "Deleted Candidate",
          votes: r.votes
        };
      })
    );

    res.json({
      success: true,
      results: formatted
    });

  } catch (error) {
    console.error("Winner-by-position error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;