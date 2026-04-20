const mongoose = require('mongoose');
const Vote = require('./models/Vote');  // adjust path if needed
const User = require('./models/User');  // adjust path if needed

// 🔑 Replace with your MongoDB connection string
const MONGO_URI = 'mongodb://127.0.0.1:27017/yourdbname';

async function checkVotes(userId) {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const votes = await Vote.find({ user: userId }).populate('candidate');

  if (votes.length === 0) {
    console.log('No votes found for this user.');
  } else {
    votes.forEach((v, i) => {
      console.log(`${i + 1}. Position: ${v.position}, Candidate: ${v.candidate ? v.candidate.firstName + ' ' + v.candidate.lastName : 'Deleted Candidate'}`);
    });
  }

  mongoose.disconnect();
}

// 🔹 Replace with the _id of a user in your database
const TEST_USER_ID = '64f0a123abcd567890efgh12';

checkVotes(TEST_USER_ID);