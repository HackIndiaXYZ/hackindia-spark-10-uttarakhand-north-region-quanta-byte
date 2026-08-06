const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

router.get('/', authMiddleware, async (req, res) => {
  return res.json(req.user.toJSON());
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    );
    return res.json(user.toJSON());
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

module.exports = router;
