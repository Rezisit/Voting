const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },

    used: { 
      type: Boolean, 
      default: false 
    },

    usedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Code", codeSchema);