const mongoose = require("mongoose");
const Candidate = require("./models/Candidate");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yourDBname";

async function updateDescriptions() {
  try {
  
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const result1 = await Candidate.updateMany(
      { description: { $exists: false } },
      { $set: { description: "No description provided" } }
    );

    const result2 = await Candidate.updateMany(
      { description: "" },
      { $set: { description: "No description provided" } }
    );

    console.log(`Updated ${result1.modifiedCount + result2.modifiedCount} candidates.`);
    process.exit(0);
  } catch (err) {
    console.error("Error updating candidates:", err);
    process.exit(1);
  }
}

updateDescriptions();