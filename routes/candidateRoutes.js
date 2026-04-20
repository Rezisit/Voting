const express = require('express');
const multer = require('multer');
const Candidate = require('../models/Candidate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// ================= GET ALL CANDIDATES =================
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});

// ================= ADD CANDIDATE =================
router.post('/', protect, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });

  try {
    const {
      firstName,
      lastName,
      candidacy,
      partylist,
      yearLevel,
      block,
      course,
      description
    } = req.body;

    const candidate = await Candidate.create({
      firstName,
      lastName,
      candidacy,
      partylist,
      yearLevel,
      block,
      course,
      description,
      image: req.file ? req.file.filename : null,
      votes: 0,
    });

    res.json(candidate);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ================= EDIT CANDIDATE =================
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });

  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate)
      return res.status(404).json({ message: 'Candidate not found' });

    const {
      firstName,
      lastName,
      candidacy,
      partylist,
      yearLevel,
      block,
      course,
      description
    } = req.body;

    candidate.firstName = firstName || candidate.firstName;
    candidate.lastName = lastName || candidate.lastName;
    candidate.candidacy = candidacy || candidate.candidacy;
    candidate.partylist = partylist || candidate.partylist;
    candidate.yearLevel = yearLevel || candidate.yearLevel;
    candidate.block = block || candidate.block;
    candidate.course = course || candidate.course;
    candidate.description = description || candidate.description;

    if (req.file) {
      candidate.image = req.file.filename;
    }

    await candidate.save();

    res.json(candidate);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ================= DELETE CANDIDATE =================
router.delete('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });

  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate)
      return res.status(404).json({ message: 'Candidate not found' });

    res.json({ message: 'Candidate deleted' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete candidate' });
  }
});

module.exports = router;