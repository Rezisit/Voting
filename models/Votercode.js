const mongoose = require("mongoose");

const voterCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },

  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  used: {
    type: Boolean,
    default: false
  },

  usedAt: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("VoterCode", voterCodeSchema);