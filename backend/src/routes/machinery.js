const express = require('express');
const router = express.Router();
const Machinery = require('../models/Machinery');

router.get('/', async (req, res) => {
  try {
    const { q, type } = req.query;
    const filter = {};

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ];
    }

    const items = await Machinery.find(filter);
    return res.json(items.map(item => item.toJSON()));
  } catch (error) {
    console.error('Get machinery error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Machinery.create(req.body);
    return res.json(item.toJSON());
  } catch (error) {
    console.error('Add machinery error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

router.post('/rent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Machinery.findById(id);
    if (!item) {
      return res.status(404).json({ detail: "Machinery not found" });
    }
    if (!item.available) {
      return res.status(400).json({ detail: "Machinery is already rented" });
    }

    item.available = false;
    await item.save();

    return res.json(item.toJSON());
  } catch (error) {
    console.error('Rent machinery error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

module.exports = router;
