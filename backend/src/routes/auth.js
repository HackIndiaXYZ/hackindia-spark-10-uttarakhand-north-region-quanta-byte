const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { id_token, name = 'किसान जी', mobile } = req.body;
    let uid = `fb_${mobile || 'default'}`;

    if (id_token && id_token.startsWith('mock_')) {
      uid = id_token.replace('mock_', '');
    }

    let user = await User.findOne({ firebase_uid: uid });
    if (!user) {
      user = await User.create({
        firebase_uid: uid,
        name: name || 'किसान जी',
        mobile: mobile || '9999999999',
        village: '',
        district: '',
        state: 'Uttar Pradesh',
        language: 'hi',
        crops: []
      });
    }

    return res.json(user.toJSON());
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

module.exports = router;
