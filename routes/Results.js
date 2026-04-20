router.get("/winner", protect, adminOnly, async (req, res) => {
  try {
    const results = await Vote.aggregate([
      {
        $group: {
          _id: "$candidate",
          totalVotes: { $sum: 1 }
        }
      },
      {
        $sort: { totalVotes: -1 }
      },
      {
        $limit: 1 
      }
    ]);

    if (results.length === 0) {
      return res.status(404).json({ message: "No votes yet" });
    }

    const winner = await Candidate.findById(results[0]._id);

    res.json({
      winner: winner.name,
      votes: results[0].totalVotes
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});