const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  crop_name: { type: String, required: true },
  emoji: { type: String, required: true },
  market: { type: String, required: true },
  state: { type: String, required: true },
  price: { type: Number, required: true },
  min_price: { type: Number, required: true },
  max_price: { type: Number, required: true },
  msp: { type: Number, default: 0 },
  change_percent: { type: Number, default: 0.0 },
  is_best: { type: Boolean, default: false },
  updated_at: { type: Date, default: Date.now }
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
