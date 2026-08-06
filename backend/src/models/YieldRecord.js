const mongoose = require('mongoose');

const yieldRecordSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop_name: { type: String, required: true },
  amount_quintal: { type: Number, required: true },
  revenue: { type: Number, required: true },
  expenses: { type: Number, required: true },
  date: { type: Date, required: true }
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

module.exports = mongoose.model('YieldRecord', yieldRecordSchema);
