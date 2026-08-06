const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const YieldRecord = require('../models/YieldRecord');

const SEED_YIELDS = [
  { crop_name: "गेहूं", amount_quintal: 120.0, revenue: 258000.0, expenses: 95000.0, date: new Date(2026, 3, 15) },
  { crop_name: "धान", amount_quintal: 90.0, revenue: 184500.0, expenses: 60000.0, date: new Date(2025, 10, 10) },
  { crop_name: "मक्का", amount_quintal: 35.0, revenue: 77500.0, expenses: 25000.0, date: new Date(2025, 7, 20) }
];

router.get('/', authMiddleware, async (req, res) => {
  try {
    let records = await YieldRecord.find({ user_id: req.user._id }).sort({ date: -1 });

    if (records.length === 0) {
      const docs = SEED_YIELDS.map(y => ({ ...y, user_id: req.user._id }));
      records = await YieldRecord.insertMany(docs);
    }

    let totalYield = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;

    records.forEach(r => {
      totalYield += r.amount_quintal;
      totalRevenue += r.revenue;
      totalExpenses += r.expenses;
    });

    const totalProfit = totalRevenue - totalExpenses;

    const formatLakh = (val) => {
      if (val >= 100000) {
        return `₹${(val / 100000).toFixed(1)}L`;
      }
      return `₹${val.toLocaleString()}`;
    };

    return res.json({
      summary: {
        total_yield: `${Math.round(totalYield)} Q`,
        revenue: formatLakh(totalRevenue),
        expenses: formatLakh(totalExpenses),
        profit: formatLakh(totalProfit),
        raw_total_yield: totalYield,
        raw_revenue: totalRevenue,
        raw_expenses: totalExpenses,
        raw_profit: totalProfit
      },
      records: records.map(r => r.toJSON())
    });
  } catch (error) {
    console.error('Get yields error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { crop_name, amount_quintal, revenue, expenses, date } = req.body;

    const record = await YieldRecord.create({
      user_id: req.user._id,
      crop_name,
      amount_quintal: parseFloat(amount_quintal),
      revenue: parseFloat(revenue),
      expenses: parseFloat(expenses),
      date: date ? new Date(date) : new Date()
    });

    return res.json(record.toJSON());
  } catch (error) {
    console.error('Add yield error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

module.exports = router;
