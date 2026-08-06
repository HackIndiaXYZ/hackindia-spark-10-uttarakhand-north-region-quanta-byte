const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');

router.get('/', async (req, res) => {
  try {
    const { category, query } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    const schemes = await Scheme.find(filter);
    return res.json(schemes.map(item => item.toJSON()));
  } catch (error) {
    console.error('Get schemes error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

module.exports = router;
