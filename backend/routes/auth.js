const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const User = require('../models/userModels');
const fetchuser = require('../middleware/fetch');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image uploads are allowed'));
  },
});

router.post(
  '/createuser',
  upload.single('pic'),
  [
    body('name', 'Name must be at least 3 characters').trim().isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;
      const pic = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : undefined;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success, error: 'User with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      const user = await User.create({ name, email, password: secPass, ...(pic ? { pic } : {}) });

      const authtoken = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: '7d' });
      success = true;

      res.status(201).json({
        success,
        authtoken,
        user: { _id: user._id, name: user.name, email: user.email, pic: user.pic },
      });
    } catch (error) {
      console.error('Error in createuser route:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
);

router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ success, error: 'Invalid credentials' });

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) return res.status(400).json({ success, error: 'Invalid credentials' });

      const authtoken = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: '7d' });
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error('Error in login route:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
);

router.get('/getuser', fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error in getuser route:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/getalluser', fetchuser, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email pic _id')
      .sort({ name: 1 });
    res.json(users);
  } catch (error) {
    console.error('Error in getalluser route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
