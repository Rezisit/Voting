const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Election", electionSchema);