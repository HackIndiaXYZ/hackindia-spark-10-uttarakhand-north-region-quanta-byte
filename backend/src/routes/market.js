const express = require('express');
const router = express.Router();
const MarketPrice = require('../models/MarketPrice');

router.get('/', async (req, res) => {
  try {
    const { crop, state } = req.query;
    const filter = {};

    if (crop) {
      filter.crop_name = { $regex: crop, $options: 'i' };
    }
    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }

    const prices = await MarketPrice.find(filter).sort({ updated_at: -1 });
    return res.json(prices.map(item => item.toJSON()));
  } catch (error) {
    console.error('Get market prices error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

module.exports = router;
