require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const voteRoutes = require('./routes/voteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const codeRoutes = require('./routes/codeRoutes');
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

// ======================
// CONNECT DATABASE
// ======================
connectDB();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

// ✅ SERVE UPLOADED IMAGES
app.use('/uploads', express.static('uploads'));

// ======================
// ROUTES
// ======================
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);

// 🔥 FIXED HERE (IMPORTANT)
app.use('/api/votes', voteRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/codes', codeRoutes);
app.use('/api/feedback', feedbackRoutes);

// ======================
// TEST ROUTE
// ======================
app.get('/', (req, res) => {
  res.send('Voting Backend Running ✅');
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});