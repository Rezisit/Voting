const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    // For registered users/admin
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // For voters (your main users)
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VoterCode",
    },

    message: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);