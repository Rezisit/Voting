const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    voterCode: {
      type: String,
      required: true,
      index: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    position: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vote", voteSchema);