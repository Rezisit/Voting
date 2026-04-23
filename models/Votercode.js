const mongoose = require("mongoose");

const voterCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },

  used: {
    type: Boolean,
    default: false,
  },

  usedAt: {
    type: Date,
    default: null,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.VoterCode ||
  mongoose.model("VoterCode", voterCodeSchema);