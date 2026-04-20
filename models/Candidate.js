const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  candidacy: { type: String, required: true },
  partylist: { type: String },
  yearLevel: { type: String },
  block: { type: String },
  course: { type: String },
  image: { type: String },
  votes: { type: Number, default: 0 },
  description: { type: String, default: '' },
});

module.exports = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);