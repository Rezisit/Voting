const mongoose = require("mongoose");
require("dotenv").config();

const Candidate = require("./models/Candidate");

async function fixPartylist() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await Candidate.updateMany(
      { $or: [{ partylist: { $exists: false } }, { partylist: null }] },
      { $set: { partylist: "N/A" } }
    );

    console.log(`Updated ${result.modifiedCount} candidates with default partylist`);
    process.exit(0);
  } catch (err) {
    console.error("Error updating candidates:", err);
    process.exit(1);
  }
}

fixPartylist();