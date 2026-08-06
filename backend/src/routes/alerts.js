const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find({ active: true }).sort({ created_at: -1 });
    return res.json(alerts.map(item => item.toJSON()));
  } catch (error) {
    console.error('Get alerts error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

module.exports = router;
